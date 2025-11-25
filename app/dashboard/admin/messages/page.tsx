'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Search, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  username: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
}

interface Conversation {
  id: string;
  participant1: string;
  participant2: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  user1: User;
  user2: User;
  messages: Message[];
  unreadCount: number;
  otherUser: User;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    fetchUserAndConversations();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchUserAndConversations = async () => {
    try {
      const [sessionRes, conversationsRes] = await Promise.all([
        fetch('/api/auth/session'),
        fetch('/api/conversations'),
      ]);

      if (sessionRes.ok) {
        const session = await sessionRes.json();
        setCurrentUserId(session.id);
      }

      if (conversationsRes.ok) {
        const data = await conversationsRes.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages);
      setSelectedConversation(data);
      
      fetchUserAndConversations();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageContent.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const newMessage = await response.json();
      setMessages([...messages, newMessage]);
      setMessageContent('');
      
      setConversations(prevConvs =>
        prevConvs.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: messageContent.substring(0, 100), lastMessageAt: new Date().toISOString() }
            : conv
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || user.email || 'Unknown User';
  };

  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const filteredConversations = conversations.filter(conv =>
    getUserDisplayName(conv.otherUser).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)]">
        <div className="flex h-full gap-4">
          <Card className="w-96 shrink-0">
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => fetchConversationMessages(conv.id)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conv.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conv.otherUser.avatarUrl || undefined} />
                          <AvatarFallback>{getUserInitials(conv.otherUser)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm truncate">
                              {getUserDisplayName(conv.otherUser)}
                            </p>
                            {conv.lastMessageAt && (
                              <span className="text-xs text-gray-500 shrink-0 ml-2">
                                {format(new Date(conv.lastMessageAt), 'MMM d')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {conv.lastMessage || 'No messages yet'}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Badge variant="default" className="shrink-0 ml-2">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.otherUser.avatarUrl || undefined} />
                      <AvatarFallback>{getUserInitials(selectedConversation.otherUser)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {getUserDisplayName(selectedConversation.otherUser)}
                      </CardTitle>
                      <p className="text-xs text-gray-500 capitalize">
                        {selectedConversation.otherUser.role.replace('_', ' ').toLowerCase()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isCurrentUser = message.senderId === currentUserId;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start gap-2 max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={message.sender.avatarUrl || undefined} />
                              <AvatarFallback>
                                {message.sender.firstName?.[0] || message.sender.username?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  isCurrentUser
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <p className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : ''}`}>
                                {format(new Date(message.createdAt), 'p')}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>
                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      disabled={isSending}
                    />
                    <Button type="submit" disabled={isSending || !messageContent.trim()}>
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
