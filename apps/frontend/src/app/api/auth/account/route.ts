export async function DELETE(req: Request) {
  void req;
  return Response.json(
    { error: "Direct deletion is disabled. Use /api/auth/account/delete/request." },
    { status: 405 },
  );
}
