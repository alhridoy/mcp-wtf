import { NextResponse } from 'next/server';
import { mcpServers } from '@/lib/data';

export async function GET() {
  console.log('Servers API called - environment:', process.env.NODE_ENV);
  try {
    // Use the hardcoded server data instead of trying to parse from README.md
    console.log('Servers API returning hardcoded data:', mcpServers.length, 'servers');
    return NextResponse.json(mcpServers);
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
}
