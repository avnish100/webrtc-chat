'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import ChatForm from './ChatForm';
import ActiveChats from './ActiveChats';
import { useSession } from 'next-auth/react';

export default function LandingPage() {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const router = useRouter();

  const handleJoin = () => {
    if (name && room) {
      router.push(`/chat?name=${encodeURIComponent(name)}&room=${encodeURIComponent(room)}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl p-6 space-y-6">
        
        <ChatForm />
        {/* <ActiveChats /> */}
      </div>
    </div>
  );
}