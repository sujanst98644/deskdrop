import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@deskdrop/db";
import { signUpSchema } from "@deskdrop/validators";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, email, hashedPassword },
  });

  return NextResponse.json({ success: true });
}
