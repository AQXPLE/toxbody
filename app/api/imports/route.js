import { NextResponse } from 'next/server';
import { db } from '@/lib/db/provider.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { fileName, parsedResult, employeeId } = body;

    if (!parsedResult) {
      return NextResponse.json(
        { error: 'parsedResult is required' },
        { status: 400 }
      );
    }

    const result = await db.commitTsvImport({
      fileName: fileName || 'legacy_import.tsv',
      parsedResult,
      employeeId: employeeId || 'emp-daniyal',
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
