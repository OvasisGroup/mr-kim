import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { participant1: session.userId },
            { participant2: session.userId },
          ],
        },
        senderId: { not: session.userId },
        isRead: false,
      },
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}
