import { NextResponse } from 'next/server';
import { getAccountTypes, ALLOWED_LEVERAGES } from '@/lib/accountTypes';

export async function GET() {
  try {
    const accountTypes = await getAccountTypes();
    return NextResponse.json({
      accountTypes,
      allowedLeverages: ALLOWED_LEVERAGES
    });
  } catch (error) {
    console.error('[Account Types GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch account types' }, { status: 500 });
  }
}
