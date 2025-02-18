import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Transaction from '@/models/Transaction';

// get a category
export async function GET(request, { params }) {
  try {
    await connectDB();
    const category = await Category.findById(params.id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 },
      );
    }
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 },
    );
  }
}

// update a category
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const category = await Category.findByIdAndUpdate(params.id, body, {
      new: true,
    });
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 },
      );
    }
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 },
    );
  }
}

// delete a category
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    await Transaction.deleteMany({ category_id: id });

    await Category.findByIdAndDelete(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
