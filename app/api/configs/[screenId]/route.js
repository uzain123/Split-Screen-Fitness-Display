import { NextResponse } from 'next/server';
import { redis } from '@/lib/kv'; // Redis client from Upstash


export const dynamic = 'force-dynamic'; // Ensures fresh fetch per request (important for serverless)

// Helper
const getDefaultConfig = () => Array(6).fill(null);

export async function GET(_, { params }) {
  const screenId = params?.screenId || 'screen-1';
  console.log(`🔍 GET: Fetching config for ${screenId}`);

  try {
    const data = await redis.get(screenId);

    if (!data) {
      console.warn(`⚠️ No config found for ${screenId}, returning default.`);
      return NextResponse.json(getDefaultConfig());
    }

    console.log(`✅ GET: Config for ${screenId}:`, data);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`❌ GET error for ${screenId}:`, error);
    return new NextResponse('Failed to load config', { status: 500 });
  }
}

export async function POST(request, { params }) {
  const screenId = params?.screenId || 'screen-1';
  console.log(`📝 POST: Saving config for ${screenId}`);

  try {
    const body = await request.json();

    if (!Array.isArray(body) || body.length !== 6) {
      console.warn(`❌ Invalid config received:`, body);
      return NextResponse.json({ error: 'Invalid config format' }, { status: 400 });
    }

    console.log(`📦 POST: Data to save:`, body);

    await redis.set(screenId, body);

    console.log(`✅ POST: Saved config for ${screenId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`❌ POST error for ${screenId}:`, error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
