import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1: session.userId },
          { participant2: session.userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            isRead: true,
            createdAt: true,
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: session.userId },
            isRead: false,
          },
        });

        const otherUser = conv.participant1 === session.userId ? conv.user2 : conv.user1;

        return {
          ...conv,
          unreadCount,
          otherUser,
        };
      })
    );

    return NextResponse.json(conversationsWithUnread);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientId } = await request.json();

    if (!recipientId) {
      return NextResponse.json(
        { error: 'Recipient ID is required' },
        { status: 400 }
      );
    }

    if (recipientId === session.userId) {
      return NextResponse.json(
        { error: 'Cannot create conversation with yourself' },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1: session.userId, participant2: recipientId },
          { participant1: recipientId, participant2: session.userId },
        ],
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participant1: session.userId,
        participant2: recipientId,
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
