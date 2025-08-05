// src/app/api/videos/delete/route.js
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '@/lib/s3Client';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { key } = await req.json();

    if (!key) {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    await s3.send(command);

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
