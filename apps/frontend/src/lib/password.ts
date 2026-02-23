import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const FORMAT_PREFIX = "scrypt";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${FORMAT_PREFIX}$${salt}$${derivedKey.toString("hex")}`;
};

export const isHashedPassword = (value: string | null | undefined): boolean =>
  typeof value === "string" && value.startsWith(`${FORMAT_PREFIX}$`);

export const verifyPassword = async (
  password: string,
  storedPassword: string | null | undefined,
): Promise<boolean> => {
  if (!password || !storedPassword) return false;
  if (!isHashedPassword(storedPassword)) {
    return password === storedPassword;
  }

  const [, salt, savedKeyHex] = storedPassword.split("$");
  if (!salt || !savedKeyHex) return false;

  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  const savedKey = Buffer.from(savedKeyHex, "hex");

  if (savedKey.length !== derivedKey.length) return false;
  return timingSafeEqual(savedKey, derivedKey);
};
