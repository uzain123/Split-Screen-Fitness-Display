// src/app/api/videos/delete/route.js
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '@/lib/s3Client';
import { NextResponse } from 'next/server';

console.log('🌐 /api/videos/delete route initialized');

export async function POST(req) {
  console.log('🟡 Starting delete operation...');
  try {
    const { key } = await req.json();

    if (!key) {
      console.warn('🟠 Delete failed: Missing key in request');
      return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }

    console.log('🟡 Received delete request for key:', key);
    console.log('🟡 Using bucket:', process.env.AWS_S3_BUCKET);

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    const result = await s3.send(command);

    console.log('✅ S3 DeleteObject result:', result);

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err);
    return NextResponse.json({ error: 'Delete failed', details: err.message }, { status: 500 });
  }
}
