import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
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
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify user is part of conversation
    if (conversation.participant1 !== session.userId && conversation.participant2 !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: session.userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (conversation.participant1 !== session.userId && conversation.participant2 !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create message and update conversation
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.userId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update conversation's last message info
    await prisma.conversation.update({
      where: { id },
      data: {
        lastMessage: content.trim().substring(0, 100),
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
