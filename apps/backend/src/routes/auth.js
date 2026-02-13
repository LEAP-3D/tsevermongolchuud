const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const { checkGlobalDailyLimit, getUBTodayDate } = require("../lib/timeUtils");

const verifyParentByTokenAndPassword = async (token, password) => {
  const tokenMatch = typeof token === "string" ? token.match(/^user_(\d+)_token$/) : null;
  const userId = tokenMatch ? Number(tokenMatch[1]) : null;
  if (!userId || !password) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });
  if (!user || user.password !== password) return null;
  return user.id;
};

const ensureChildBelongsToParent = async (childId, parentId) => {
  const child = await prisma.child.findUnique({
    where: { id: Number(childId) },
    select: { id: true, parentId: true },
  });
  if (!child || child.parentId !== parentId) return null;
  return child;
};

const grantDailyRemainingSeconds = async (childId, grantSeconds) => {
  const childIdNum = Number(childId);
  const grant = Math.max(1, Math.floor(Number(grantSeconds) || 0));
  const before = await checkGlobalDailyLimit(childIdNum);

  if (!before.limitSeconds) {
    return {
      before,
      after: before,
      changed: false,
    };
  }

  const limitSeconds = Number(before.limitSeconds);
  const targetRemaining = Math.max(0, Math.min(grant, limitSeconds));
  const targetUsed = Math.max(0, limitSeconds - targetRemaining);
  const today = getUBTodayDate();

  await prisma.$transaction(async (tx) => {
    const rows = await tx.dailyUsage.findMany({
      where: { childId: childIdNum, date: today },
      orderBy: { duration: "desc" },
      select: { id: true, duration: true },
    });

    let keepUsed = targetUsed;
    for (const row of rows) {
      const current = Number(row.duration ?? 0);
      const next = Math.max(0, Math.min(current, keepUsed));
      keepUsed -= next;

      if (next <= 0) {
        await tx.dailyUsage.delete({ where: { id: row.id } });
      } else if (next !== current) {
        await tx.dailyUsage.update({
          where: { id: row.id },
          data: { duration: next },
        });
      }
    }
  });

  const after = await checkGlobalDailyLimit(childIdNum);
  return {
    before,
    after,
    changed: true,
  };
};

// 1. Эцэг эх нэвтрэх (Parent Login)
router.post("/parent-login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Хэрэглэгчийг имэйлээр хайх
    const user = await prisma.user.findUnique({
      where: { email },
      include: { children: true }, // Хүүхдүүдийн мэдээллийг хамт авна
    });

    // Хэрэглэгч олдсонгүй эсвэл нууц үг буруу (Энгийн шалгалт)
    // Санамж: Бодит төсөл дээр bcrypt ашиглан нууц үгийг hash хийх ёстой
    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Имэйл эсвэл нууц үг буруу байна." });
    }

    // Амжилттай бол хүүхдүүдийн жагсаалтыг буцаана
    const childrenList = user.children.map((child) => ({
      id: child.id,
      name: child.name,
    }));

    res.json({
      success: true,
      token: `user_${user.id}_token`, // Түр token (JWT байвал сайн)
      children: childrenList,
    });
  } catch (error) {
    next(error);
  }
});

// 2. Хүүхдийн PIN шалгах (Verify PIN)
router.post("/verify-pin", async (req, res, next) => {
  try {
    const { childId, pin } = req.body;

    const child = await prisma.child.findUnique({
      where: { id: Number(childId) },
    });

    if (!child || child.pin !== pin) {
      return res
        .status(401)
        .json({ success: false, message: "PIN код буруу байна." });
    }

    res.json({ success: true, message: "PIN зөв байна." });
  } catch (error) {
    next(error);
  }
});

// 3. Эцэг эхийн нууц үг шалгах (Logout хийх үед)
router.post("/verify-parent", async (req, res, next) => {
  try {
    const { email, password } = req.body; // Extension-оос имэйлийг нь бас явуулах хэрэгтэй

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 3.1 Parent token + password verify (blocked page emergency unblock)
router.post("/verify-parent-token", async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const parentId = await verifyParentByTokenAndPassword(token, password);
    if (!parentId) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 3.2 Grant exactly N seconds remaining on daily limit (default 15 min)
router.post("/grant-daily-time", async (req, res, next) => {
  try {
    const { token, password, childId, seconds } = req.body;
    const parentId = await verifyParentByTokenAndPassword(token, password);
    if (!parentId) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const childIdNum = Number(childId);
    if (!Number.isFinite(childIdNum) || childIdNum <= 0) {
      return res.status(400).json({ success: false, message: "Invalid childId." });
    }

    const child = await ensureChildBelongsToParent(childIdNum, parentId);
    if (!child) {
      return res.status(403).json({ success: false, message: "Forbidden child access." });
    }

    const grantResult = await grantDailyRemainingSeconds(childIdNum, Number(seconds) || 15 * 60);
    return res.json({
      success: true,
      changed: grantResult.changed,
      before: {
        limitSeconds: grantResult.before.limitSeconds,
        remainingSeconds: grantResult.before.remainingSeconds,
        isBlocked: grantResult.before.isBlocked,
      },
      after: {
        limitSeconds: grantResult.after.limitSeconds,
        remainingSeconds: grantResult.after.remainingSeconds,
        isBlocked: grantResult.after.isBlocked,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 4. Хүүхдийн өдөр тутмын үлдэгдэл секунд авах
router.get("/daily-remaining", async (req, res, next) => {
  try {
    const childId = Number(req.query?.childId);
    if (!Number.isFinite(childId) || childId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid childId" });
    }

    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { id: true },
    });
    if (!child) {
      return res.status(404).json({ success: false, message: "Child not found" });
    }

    const status = await checkGlobalDailyLimit(childId);
    return res.json({
      success: true,
      isBlocked: status.isBlocked,
      remainingSeconds: status.remainingSeconds,
      usedSeconds: status.usedSeconds ?? 0,
      limitSeconds: status.limitSeconds,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
