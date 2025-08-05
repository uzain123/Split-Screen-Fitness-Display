// src/app/api/videos/upload/route.js
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '@/lib/s3Client';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !file.name) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: file.name,
      Body: buffer,
      ContentType: file.type,
    });

    await s3.send(command);

    return NextResponse.json({ message: 'Upload successful' });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
