import { NextResponse } from 'next/server';
import { db } from '@/lib/db/provider.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { accountId, employeeId, handlesText, outreachDate, status, notes } = body;

    if (!accountId || !handlesText) {
      return NextResponse.json(
        { error: 'accountId and handlesText are required' },
        { status: 400 }
      );
    }

    const result = await db.submitOutreachBatch({
      accountId,
      employeeId: employeeId || 'emp-daniyal',
      handlesText,
      outreachDate: outreachDate || new Date().toISOString(),
      status: status || 'Contacted',
      notes: notes || '',
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
