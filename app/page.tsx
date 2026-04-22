'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ParticleBackground } from '@/components/particle-background';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'ai',
      title: 'AI-Powered Studio',
      description: 'Advanced AI chatbot for creative collaboration, coding, and design',
      icon: '✨',
    },
    {
      id: 'credits',
      title: 'Credit System',
      description: 'Flexible credit-based pricing for all your creative projects',
      icon: '💎',
    },
    {
      id: 'realtime',
      title: 'Real-time Sync',
      description: 'Instant synchronization across all your conversations and projects',
      icon: '⚡',
    },
    {
      id: 'collab',
      title: 'Collaboration',
      description: 'Work together with teammates in shared creative spaces',
      icon: '🤝',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <ParticleBackground />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-border/30 backdrop-blur-sm">
        <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          HELLX
        </div>
        <div className="flex items-center gap-8">
          <Link href="#features" className="text-sm hover:text-purple-400 transition">
            Features
          </Link>
          <Link href="#pricing" className="text-sm hover:text-purple-400 transition">
            Pricing
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-7xl font-bold mb-6 text-balance">
            The Premium AI Studio<br />
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              for Creative Professionals
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 text-balance">
            Collaborate with advanced AI across coding, design, and creative projects. Seamless integration, premium experience.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Start Creating Now
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-8 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 text-balance">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`p-6 rounded-lg border transition-all duration-300 ${
                  hoveredFeature === feature.id
                    ? 'border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/20'
                    : 'border-border bg-card'
                }`}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-8 border-t border-border/30 bg-gradient-to-b from-transparent to-purple-500/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Create?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of professionals using HELLX Studio to bring their ideas to life.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
