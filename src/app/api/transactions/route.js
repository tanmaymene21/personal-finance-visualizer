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

    // Ensure we're returning an array, even if empty
    return NextResponse.json(transactions || []);
  } catch (error) {
    console.error('Transaction fetch error:', error);
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

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('category_id')
      .populate('account');

    return NextResponse.json(populatedTransaction);
  } catch (error) {
    console.error('Transaction creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 },
    );
  }
}
