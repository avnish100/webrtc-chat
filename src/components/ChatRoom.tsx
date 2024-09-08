'use client'

import { useRouter } from 'next/navigation'
import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, LogOut } from "lucide-react"

interface Message {
  sender: string
  content: string
}

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const searchParams = useSearchParams()
  const name = searchParams.get('name') || 'Anonymous'
  const room = searchParams.get('room') || 'default'
  const signalingRef = useRef<WebSocket | null>(null)
  const [peerId, setPeerId] = useState<string>('')
  const router = useRouter()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initWebRTC = async () => {
      signalingRef.current = new WebSocket('ws://localhost:8080')

      signalingRef.current.onopen = () => {
        setIsLoading(false)
        signalingRef.current?.send(JSON.stringify({ type: 'join', name, room }))
      }

      signalingRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data)
        console.log('Received WebSocket message:', message)

        switch (message.type) {
          case 'joined':
            setPeerId(message.peerId)
            break
          case 'chat-message':
            handleIncomingMessage(message)
            break
          case 'peer-disconnected':
            console.log('Peer disconnected:', message.peerId)
            break
          default:
            console.error('Unknown message type:', message.type)
        }
      }

      signalingRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      signalingRef.current.onclose = () => {
        setIsLoading(true)
        console.log('WebSocket connection closed.')
      }

      return () => {
        signalingRef.current?.close()
      }
    }

    initWebRTC()
  }, [name, room])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleIncomingMessage = (message: any) => {
    if (message.sender !== name) {
      setMessages(prevMessages => [...prevMessages, { sender: message.sender, content: message.content }])
    }
  }

  const handleExit = () => {
    if (peerId) {
      signalingRef.current?.send(JSON.stringify({
        type: 'peer-disconnected',
        room,
        peerId
      }))
    }
    signalingRef.current?.close()
    router.push('/')
  }

  const sendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = { sender: name, content: inputMessage.trim() }
      setMessages(prevMessages => [...prevMessages, newMessage])

      signalingRef.current?.send(JSON.stringify({
        type: 'chat-message',
        ...newMessage,
        room
      }))

      setInputMessage('')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Chat Room: {room}</CardTitle>
          <Button onClick={handleExit} variant="outline" size="icon" className="h-8 w-8">
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Exit chat</span>
          </Button>
        </CardHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-2 mb-4 ${
                      msg.sender === name ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender !== name && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{msg.sender[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg p-3 max-w-[70%] ${
                        msg.sender === name
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.sender !== name && (
                        <p className="font-semibold text-sm mb-1">{msg.sender}</p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    {msg.sender === name && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{name[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendMessage()
                }}
                className="flex w-full space-x-2"
              >
                <Input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow"
                />
                <Button type="submit" size="icon" disabled={!inputMessage.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}