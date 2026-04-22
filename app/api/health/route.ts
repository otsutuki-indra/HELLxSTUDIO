import { ensureDatabase } from '@/lib/auth';

export async function GET() {
  try {
    await ensureDatabase();
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
    });
  } catch (error) {
    console.error('[v0] Health check failed:', error);
    return Response.json(
      {
        status: 'unhealthy',
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
