import { NextResponse } from 'next/server';
import { parseMCPServers } from '@/lib/parser';

export async function GET() {
  try {
    const servers = parseMCPServers();
    return NextResponse.json(servers);
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
}
