import { verifySession, getUserById, deductCredits, ensureDatabase } from '@/lib/auth';
import { createClient } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';
import { streamText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  try {
    await ensureDatabase();

    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await verifySession(token);
    if (!userId) {
      return Response.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const { message, conversationId, topic } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message required' }, { status: 400 });
    }

    if ((user.credits as number) < 1) {
      return Response.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    // Save user message
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });

    let convId = conversationId;
    if (!convId) {
      convId = uuidv4();
      await client.execute({
        sql: `INSERT INTO conversations (id, user_id, title, topic) VALUES (?, ?, ?, ?)`,
        args: [convId, userId, message.substring(0, 50), topic || 'general'],
      });
    }

    const messageId = uuidv4();
    await client.execute({
      sql: `INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)`,
      args: [messageId, convId, 'user', message],
    });

    // Stream AI response
    const { textStream } = await streamText({
      model: groq('mixtral-8x7b-32768'),
      system:
        'You are HELLX Studio AI Assistant - a premium creative collaborator. Help with coding, design, marketing, and creative projects. Be concise, professional, and insightful.',
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
    });

    // Collect response
    let fullResponse = '';
    for await (const chunk of textStream) {
      fullResponse += chunk;
    }

    // Save assistant message
    const assistantMessageId = uuidv4();
    await client.execute({
      sql: `INSERT INTO messages (id, conversation_id, role, content, tokens_used) VALUES (?, ?, ?, ?, ?)`,
      args: [assistantMessageId, convId, 'assistant', fullResponse, 1],
    });

    // Deduct credits
    await deductCredits(userId, 1, `Chat message - ${topic || 'general'}`);

    return Response.json({
      conversationId: convId,
      response: fullResponse,
      creditsRemaining: (user.credits as number) - 1,
    });
  } catch (error: any) {
    console.error('[v0] Chat error:', error);
    return Response.json(
      { error: error.message || 'Chat failed' },
      { status: 500 }
    );
  }
}
