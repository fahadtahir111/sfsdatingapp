import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password, name, referralCode } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Missing email or password' },
        { status: 400 }
      );
    }

    const exist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (exist) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    if (referralCode) {
      try {
        const { linkReferral } = await import("../../../referrals/actions");
        await linkReferral(user.id, referralCode);
      } catch (err) {
        console.error("Failed to link referral:", err);
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 
