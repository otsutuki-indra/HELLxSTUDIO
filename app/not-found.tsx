'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function NotFound() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-500/10 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-2xl font-semibold mb-2 text-foreground">Page Not Found</p>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button
          onClick={() => router.push('/')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
