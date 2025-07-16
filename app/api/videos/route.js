import { NextResponse } from 'next/server';
import { videoList } from '@/lib/videoList';

export async function GET() {
  return NextResponse.json(videoList);
}
