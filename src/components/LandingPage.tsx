'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

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
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Join Chat</CardTitle>
          <CardDescription>Enter your name and room to join</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Room Name"
              value={room}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoom(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleJoin}>Join Chat</Button>
        </CardFooter>
      </Card>
    </div>
  );
}