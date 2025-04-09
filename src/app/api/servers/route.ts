import { NextResponse } from 'next/server';
import { parseMCPServers } from '@/lib/parser';

export async function GET() {
  console.log('Servers API called - environment:', process.env.NODE_ENV);
  try {
    const servers = parseMCPServers();
    console.log('Servers API successfully fetched:', servers?.length || 0, 'servers');
    return NextResponse.json(servers);
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
}
