import { promises as fs } from 'node:fs';
import path from 'node:path';
import { connection, NextResponse } from 'next/server';

export async function GET() {
  await connection();
  const snapshotPath = path.join(process.cwd(), '.daemon', 'snapshot.json');
  try {
    const snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
    return NextResponse.json({ snapshot }, { headers: { 'cache-control': 'no-store' } });
  } catch {
    return NextResponse.json(
      { error: 'No watcher snapshot yet.' },
      { status: 404, headers: { 'cache-control': 'no-store' } }
    );
  }
}
