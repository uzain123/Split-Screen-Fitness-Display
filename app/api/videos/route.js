// src/app/api/videos/route.js
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3 } from '@/lib/s3Client';
import { NextResponse } from 'next/server';

const BUCKET_NAME = process.env.AWS_S3_BUCKET;
const BUCKET_REGION = process.env.AWS_REGION;

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    });

    const { Contents } = await s3.send(command);

    const videoUrls = Contents
      .filter(file => file.Key.endsWith('.mp4') || file.Key.endsWith('.mov')) // filter only videos
      .map(file => `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${file.Key}`);

    return NextResponse.json(videoUrls);
  } catch (err) {
    console.error('Error fetching S3 objects:', err);
    return NextResponse.json({ error: 'Failed to load videos' }, { status: 500 });
  }
}
