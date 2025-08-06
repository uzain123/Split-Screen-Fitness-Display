// src/app/api/videos/upload/route.js

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '@/lib/s3Client';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { filename, fileType } = await req.json();

    if (!filename || !fileType) {
      return NextResponse.json({ error: 'Missing filename or fileType' }, { status: 400 });
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `videos/${filename}`,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 1 minute

    return NextResponse.json({
      uploadUrl: signedUrl,
      key: `videos/${filename}`,
    });
  } catch (err) {
    console.error('Presign error:', err);
    return NextResponse.json({ error: 'Failed to generate presigned URL' }, { status: 500 });
  }
}
