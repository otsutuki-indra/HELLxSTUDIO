import { createClient } from '@libsql/client';
import { hashPassword, createUser, createSession, ensureDatabase } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await ensureDatabase();
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser(email, username, hashedPassword);
    const token = await createSession(user.id);

    const response = Response.json({ user, token }, { status: 201 });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('[v0] Signup error:', error);
    if (error.message?.includes('UNIQUE constraint failed')) {
      return Response.json(
        { error: 'Email or username already exists' },
        { status: 409 }
      );
    }
    return Response.json(
      { error: error.message || 'Signup failed' },
      { status: 500 }
    );
  }
}
