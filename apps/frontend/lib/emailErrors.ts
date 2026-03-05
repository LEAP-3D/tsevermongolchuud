export const toEmailUserMessage = (error: unknown): string => {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const text = raw.toLowerCase();

  const authFailed =
    text.includes("invalid login") ||
    text.includes("badcredentials") ||
    text.includes("535") ||
    text.includes("username and password not accepted");
  if (authFailed) {
    return "We couldn't send the email right now. Please contact support if this keeps happening.";
  }

  const providerUnavailable =
    text.includes("econnrefused") ||
    text.includes("enotfound") ||
    text.includes("etimedout") ||
    text.includes("socket hang up");
  if (providerUnavailable) {
    return "We couldn't send the email right now. Please try again in a few minutes.";
  }

  return "We couldn't send the email right now. Please try again later.";
};
