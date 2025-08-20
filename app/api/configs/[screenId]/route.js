import { redis } from "@/lib/kv"; // Redis client from Upstash
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Ensures fresh fetch per request (important for serverless)

// Helper to get default config with new structure
const getDefaultConfig = () => ({
  videoAssignments: Array(6).fill(null), // Array of {url, title} objects
  globalTimers: {
    timer1: 60, // Station timer
    timer2: 60, // Middle top timer
    timer3: 2700, // Warmup timer (45 minutes)
    timer4: 120, // Class countdown timer (2 minutes)
    delay1: 30, // Delay duration
    delayText1: "Move to the next station"
  }
});

export async function GET(_, { params }) {
  params = await params;
  const screenId = params?.screenId || "screen-1";

  try {
    const data = await redis.get(screenId);

    if (!data) {
      console.warn(`⚠️ No config found for ${screenId}, returning default.`);
      return NextResponse.json(getDefaultConfig());
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`❌ GET error for ${screenId}:`, error);
    return new NextResponse("Failed to load config", { status: 500 });
  }
}

export async function POST(request, { params }) {
  params = await params;
  const screenId = params?.screenId || "screen-1";

  try {
    const body = await request.json();

    // Validate new config structure
    if (!body || typeof body !== "object" || !body.videoAssignments || !body.globalTimers) {
      console.warn(`❌ Invalid config structure received:`, body);
      return NextResponse.json(
        { error: "Invalid config format. Expected {videoAssignments, globalTimers}" },
        { status: 400 }
      );
    }

    // Validate videoAssignments is an array of 6 items
    if (!Array.isArray(body.videoAssignments) || body.videoAssignments.length !== 6) {
      console.warn(`❌ Invalid videoAssignments received:`, body.videoAssignments);
      return NextResponse.json(
        { error: "videoAssignments must be an array of 6 items" },
        { status: 400 }
      );
    }

    // Validate globalTimers structure
    const requiredTimers = ["timer1", "timer2", "timer3", "timer4", "delay1", "delayText1"];
    for (const timer of requiredTimers) {
      if (!(timer in body.globalTimers)) {
        console.warn(`❌ Missing timer '${timer}' in globalTimers:`, body.globalTimers);
        return NextResponse.json({ error: `Missing required timer: ${timer}` }, { status: 400 });
      }
    }

    await redis.set(screenId, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}
