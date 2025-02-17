import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';

// get all transactions
export async function GET(request) {
  try {
    await connectDB();
    const user_id = 'test-user';
    const transactions = await Transaction.find({ user_id })
      .populate('category_id')
      .populate('account')
      .sort({ date: -1 });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 },
    );
  }
}

// create a transaction
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const user_id = 'test-user';
    const transaction = await Transaction.create({ ...body, user_id });
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 },
    );
  }
}
