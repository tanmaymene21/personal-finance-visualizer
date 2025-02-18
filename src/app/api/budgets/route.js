import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Budget from '@/models/Budget';

// Get all budgets for a specific month and year
export async function GET(request) {
  try {
    await connectDB();
    const user_id = 'test-user'; // Replace with actual user authentication
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month'));
    const year = parseInt(searchParams.get('year'));

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 },
      );
    }

    const budgets = await Budget.find({
      user_id,
      month,
      year,
    }).populate('category_id');

    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 },
    );
  }
}

// Create or update a budget
export async function POST(request) {
  try {
    await connectDB();
    const user_id = 'test-user'; // Replace with actual user authentication
    const body = await request.json();

    const { budget_type, amount, month, year, category_id } = body;

    // Validate required fields
    if (!budget_type || !amount || !month || !year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Validate budget type and category combination
    if (budget_type === 'category' && !category_id) {
      return NextResponse.json(
        { error: 'Category ID is required for category budgets' },
        { status: 400 },
      );
    }

    // Find existing budget or create new one
    const budget = await Budget.findOneAndUpdate(
      {
        user_id,
        month,
        year,
        budget_type,
        ...(category_id && { category_id }),
      },
      {
        amount,
        user_id,
        month,
        year,
        budget_type,
        ...(category_id && { category_id }),
      },
      {
        upsert: true,
        new: true,
      },
    ).populate('category_id');

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Budget creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create/update budget' },
      { status: 500 },
    );
  }
}
