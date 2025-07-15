import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'screenConfigs.json');
  const file = await fs.readFile(filePath, 'utf-8');
  const config = JSON.parse(file);

  return NextResponse.json(config['screen-1'] || Array(6).fill(null));
}
export async function POST(request) {
  const filePath = path.join(process.cwd(), 'public', 'screenConfigs.json');
  const body = await request.json();

  const file = await fs.readFile(filePath, 'utf-8');
  const config = JSON.parse(file);

  config['screen-1'] = body;

  await fs.writeFile(filePath, JSON.stringify(config, null, 2), 'utf-8');

  return NextResponse.json({ success: true });
}
