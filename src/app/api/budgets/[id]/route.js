import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Budget from '@/models/Budget';

// get a budget
export async function GET(request, { params }) {
  try {
    await connectDB();
    const budget = await Budget.findById(params.id).populate('category_id');
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    return NextResponse.json(budget);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 },
    );
  }
}

// update a budget
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const budget = await Budget.findByIdAndUpdate(params.id, body, {
      new: true,
    }).populate('category_id');
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    return NextResponse.json(budget);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 },
    );
  }
}

// delete a budget
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const budget = await Budget.findByIdAndDelete(params.id);
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 },
    );
  }
}
