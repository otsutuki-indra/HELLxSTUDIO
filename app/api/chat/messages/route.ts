import { verifySession, ensureDatabase } from '@/lib/auth';
import { createClient } from '@libsql/client';

export async function GET(req: Request) {
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

    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('id');

    if (!conversationId) {
      return Response.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const result = await client.execute({
      sql: `SELECT id, role, content, created_at FROM messages 
            WHERE conversation_id = ? 
            ORDER BY created_at ASC`,
      args: [conversationId],
    });

    return Response.json({ messages: result.rows });
  } catch (error: any) {
    console.error('[v0] Fetch messages error:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
