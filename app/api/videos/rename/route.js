// src/app/api/videos/rename/route.js
import {
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { s3 } from '@/lib/s3Client';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { oldKey, newKey } = await req.json();

    if (!oldKey || !newKey) {
      return NextResponse.json({ error: 'Missing keys' }, { status: 400 });
    }

    const copyCommand = new CopyObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      CopySource: `${process.env.AWS_S3_BUCKET}/${oldKey}`,
      Key: newKey,
    });

    await s3.send(copyCommand);

    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: oldKey,
    });

    await s3.send(deleteCommand);

    return NextResponse.json({ message: 'Rename successful' });
  } catch (err) {
    console.error('Rename error:', err); // This will show full error object

    // Try to extract useful error info
    return NextResponse.json(
      {
        error: err?.message || 'Rename failed',
        details: err?.$metadata || null,
      },
      { status: 500 }
    );
  }
}
