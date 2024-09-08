'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import ChatForm from '@/components/ChatForm';
import ActiveChats from '@/components/ActiveChats';
import { useSession } from 'next-auth/react';

export default function LandingPage() {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleJoin = () => {
    if (name && room) {
      router.push(`/chat?name=${encodeURIComponent(name)}&room=${encodeURIComponent(room)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Welcome to ChatApp</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <ChatForm />
          <ActiveChats />
        </div>
      </div>
    </div>
  );
}