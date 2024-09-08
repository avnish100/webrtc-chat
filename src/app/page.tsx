'use client'
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Welcome to ChatApp</h1>
      <p className="text-xl mb-8">Chat with fellow chatters</p>
      <div className="space-x-4">
        <Link href="/login">
          <Button size="lg">Login</Button>
        </Link>
        <Link href="/register">
          <Button size="lg" variant="outline">Register</Button>
        </Link>
      </div>
    </div>
  );
}