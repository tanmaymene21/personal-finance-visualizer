import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/Account';

// update an account
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    const account = await Account.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 },
    );
  }
}

// delete an account
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const account = await Account.findByIdAndDelete(id);

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 },
    );
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const account = await Account.findById(id);

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 },
    );
  }
}
