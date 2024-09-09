import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Define the Room type based on your Prisma schema
type Room = {
  id: string;
  name: string;
  participants: number;
};

async function getActiveChats(): Promise<Room[]> {
  try {
    const response = await fetch('/api/chat');
    if (!response.ok) {
      throw new Error('Failed to fetch chat rooms');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return [];
  }
}

async function joinChat(room: string, userName:string): Promise<Room | null> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ room,action:'join' }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to join chat room');
    }
    return await response.json();
  } catch (error) {
    console.error('Error joining chat room:', error);
    return null;
  }
}

export default function ActiveChats() {
    
  const [chats, setChats] = useState<Room[]>([]);
  const { data: session, status } = useSession(); 
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const  userName: any = session?.user?.name
  useEffect(() => {
    const fetchChats = async () => {
      const activeChats = await getActiveChats();
      setChats(activeChats);
    };
    fetchChats();
    setIsLoading(false);
  }, []);

  const handleJoinChat = async (room: string) => {
    setIsLoading(false);
    const result = await joinChat(room,userName);
    if (result) {
      // Optionally update the local state or trigger a refetch
      const updatedChats = await getActiveChats();
      setChats(updatedChats);
      router.push(`/chat?name=${encodeURIComponent(userName)}&room=${encodeURIComponent(room)}`);
    }else{
        setIsLoading(false);
    }
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Active Chats</CardTitle>
        <CardDescription>Join an existing chat room</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {chats.map((chat) => (
            <li key={chat.id}>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleJoinChat(chat.name)}
                disabled={isLoading}
              >
                <span>{chat.name}</span>
                <span className="flex items-center text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  {chat.participants}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}