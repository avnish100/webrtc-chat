'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default function ChatForm() {
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const router = useRouter()

  const handleJoin = async () => {
    if (name && room) {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, room,action:'join' }),
        })
  
        if (res.ok) {
          router.push(`/chat?name=${encodeURIComponent(name)}&room=${encodeURIComponent(room)}`)
        } else {
          console.error('Failed to join chat')
        }
      } catch (error) {
        console.error('Error joining chat:', error)
      }
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
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
  )
}