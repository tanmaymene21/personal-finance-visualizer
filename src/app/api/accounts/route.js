import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/Account';

// get all accounts
export async function GET(request) {
  try {
    await connectDB();
    const user_id = 'test-user';
    const accounts = await Account.find({ user_id });
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 },
    );
  }
}

// create an account
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const user_id = 'test-user';
    const account = await Account.create({ ...body, user_id });
    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 },
    );
  }
}
