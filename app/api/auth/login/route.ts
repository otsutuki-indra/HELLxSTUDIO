import { verifyPassword, getUserByEmail, createSession, ensureDatabase } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await ensureDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password_hash as string);

    if (!isValid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createSession(user.id as string);

    const response = Response.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        credits: user.credits,
        tier: user.tier,
      },
      token,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('[v0] Login error:', error);
    return Response.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
