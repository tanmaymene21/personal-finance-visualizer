import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Budget from '@/models/Budget';

// get all budgets
export async function GET(request) {
  try {
    await connectDB();
    const user_id = 'test-user';
    const budgets = await Budget.find({ user_id }).populate('category_id');
    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 },
    );
  }
}

// create a budget
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const user_id = 'test-user';
    const budget = await Budget.create({ ...body, user_id });
    return NextResponse.json(budget);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 },
    );
  }
}
