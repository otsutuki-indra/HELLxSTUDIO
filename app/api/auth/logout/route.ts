import { revokeSession, verifySession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return Response.json({ error: 'No token' }, { status: 401 });
    }

    await revokeSession(token);
    return Response.json({ success: true });
  } catch (error) {
    console.error('[v0] Logout error:', error);
    return Response.json({ error: 'Logout failed' }, { status: 500 });
  }
}
