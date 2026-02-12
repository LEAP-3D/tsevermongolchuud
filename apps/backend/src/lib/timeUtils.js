const prisma = require("./prisma");

// Улаанбаатарын цагаар "Өнөөдөр"-ийн огноог UTC 00:00 дээр тогтвортой авна
// Энэ нь DB-ийн DATE талбарт зөв өдөр буухад тусална.
function getUBTodayDate() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find(part => part.type === "year")?.value ?? 0);
  const month = Number(parts.find(part => part.type === "month")?.value ?? 1);
  const day = Number(parts.find(part => part.type === "day")?.value ?? 1);
  return new Date(Date.UTC(year, month - 1, day));
}

// Улаанбаатарын яг одоогийн цагийг авах (History visitedAt-д зориулж)
function getUBCurrentTime() {
  const now = new Date();
  // Одоогийн системийг цагийг UB руу хөрвүүлэх
  const ubString = now.toLocaleString("en-US", {
    timeZone: "Asia/Ulaanbaatar",
  });
  return new Date(ubString);
}

async function checkTimeLimit(childId, categoryId) {
  const today = getUBTodayDate();

  // 1. Тухайн өдрийн хэрэглээг авах
  const usage = await prisma.dailyUsage.findUnique({
    where: {
      childId_categoryId_date: {
        childId: Number(childId),
        categoryId: Number(categoryId),
        date: today,
      },
    },
  });

  const usedSeconds = usage ? usage.duration : 0;

  // 2. Хүүхдийн тохиргоог шалгах
  const setting = await prisma.childCategorySetting.findUnique({
    where: {
      childId_categoryId: {
        childId: Number(childId),
        categoryId: Number(categoryId),
      },
    },
  });

  // --- ШИНЭЧЛЭЛТ: BLOCKED төлөвийг шалгах ---
  if (!setting) {
    return { isBlocked: false, remainingSeconds: null };
  }

  // Хэрэв эцэг эх шууд БЛОКЛОСОН бол хугацаа харахгүй шууд хаана
  if (setting.status === "BLOCKED") {
    return {
      isBlocked: true,
      usedSeconds,
      limitSeconds: 0,
      remainingSeconds: 0,
    };
  }

  // Хэрэв хязгаар тогтоогоогүй бол (ALLOWED)
  if (setting.status !== "LIMITED" || !setting.timeLimit) {
    return { isBlocked: false, remainingSeconds: null };
  }

  // 3. LIMITED үед хугацаа шалгах
  const limitSeconds = setting.timeLimit * 60;
  const isBlocked = usedSeconds >= limitSeconds;

  return {
    isBlocked,
    usedSeconds,
    limitSeconds,
    remainingSeconds: Math.max(0, limitSeconds - usedSeconds),
  };
}

module.exports = {
  getUBTodayDate,
  getUBCurrentTime,
  checkTimeLimit,
};
