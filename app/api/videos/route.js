import fs from 'fs';
import path from 'path';

export async function GET() {
  const videoDir = path.join(process.cwd(), 'public/videos');

  try {
    const files = fs.readdirSync(videoDir).filter(file => file.endsWith('.mp4'));
    const videoPaths = files.map(file => `/videos/${file}`);
    
    return new Response(JSON.stringify(videoPaths), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Unable to read video directory' }), {
      status: 500
    });
  }
}
