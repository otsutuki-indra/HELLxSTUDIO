import { verifySession, getUserById, ensureDatabase } from '@/lib/auth';
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

    const user = await getUserById(userId);
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });

    const conversations = await client.execute({
      sql: `SELECT id, title, topic, created_at 
            FROM conversations 
            WHERE user_id = ? 
            ORDER BY created_at DESC
            LIMIT 50`,
      args: [userId],
    });

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        credits: user.credits,
        tier: user.tier,
      },
      conversations: conversations.rows,
    });
  } catch (error: any) {
    console.error('[v0] Dashboard data error:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
