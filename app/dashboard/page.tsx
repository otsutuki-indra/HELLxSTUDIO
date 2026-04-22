'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: number;
}

interface Conversation {
  id: string;
  title: string;
  topic: string;
  created_at: number;
}

interface User {
  id: string;
  email: string;
  username: string;
  credits: number;
  tier: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchDashboardData(token);
  }, []);

  const fetchDashboardData = async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        router.push('/login');
        return;
      }

      const data = await response.json();
      setUser(data.user);
      setConversations(data.conversations);
    } catch (error) {
      console.error('[v0] Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch(`/api/chat/messages?id=${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('[v0] Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    setSending(true);
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: input,
          conversationId: activeConversation,
          topic: 'general',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to send message');
        return;
      }

      setActiveConversation(data.conversationId);
      setMessages([
        ...messages,
        { id: '1', role: 'user', content: input },
        { id: '2', role: 'assistant', content: data.response },
      ]);
      setInput('');
      setUser((prev) => prev ? { ...prev, credits: data.creditsRemaining } : null);
    } catch (error) {
      console.error('[v0] Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card/30 flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            HELLX Studio
          </h2>
          {user && (
            <p className="text-sm text-muted-foreground mt-2">
              {user.username}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={() => {
              setActiveConversation(null);
              setMessages([]);
              setInput('');
            }}
          >
            New Chat
          </Button>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground px-2">
              Recent Conversations
            </p>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConversation(conv.id);
                  fetchMessages(conv.id);
                }}
                className={`w-full text-left p-3 rounded-lg text-sm transition truncate ${
                  activeConversation === conv.id
                    ? 'bg-purple-500/20 border border-purple-500'
                    : 'hover:bg-card'
                }`}
              >
                {conv.title}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border space-y-3">
          {user && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Credits</p>
              <p className="text-lg font-bold text-purple-400">
                {user.credits}
              </p>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full text-xs"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Welcome to HELLX Studio
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start a conversation with your AI assistant
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl p-4 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-purple-500/20 border border-purple-500'
                      : 'bg-card border border-border'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-6">
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message HELLX AI..."
              disabled={sending || !user || user.credits < 1}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={sending || !user || user.credits < 1}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {sending ? <Spinner className="w-4 h-4" /> : 'Send'}
            </Button>
          </form>
          {user && user.credits < 1 && (
            <p className="text-xs text-red-500 mt-2">
              Insufficient credits. Please purchase more credits to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
