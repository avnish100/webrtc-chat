'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

interface Message {
  sender: string;
  content: string;
}

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Anonymous';
  const room = searchParams.get('room') || 'default';
  const signalingRef = useRef<WebSocket | null>(null);
  const [peerId, setPeerId] = useState<string>(''); // Peer ID state
  const router = useRouter();

  useEffect(() => {
    const initWebRTC = async () => {
      signalingRef.current = new WebSocket('ws://localhost:8080');

      signalingRef.current.onopen = () => {
        setIsLoading(false); // Set loading to false when connection opens
        signalingRef.current?.send(JSON.stringify({ type: 'join', name, room }));
      };

      signalingRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Received WebSocket message:', message);

        switch (message.type) {
          case 'joined':
            setPeerId(message.peerId); // Set peer ID when joining
            break;
          case 'chat-message':
            handleIncomingMessage(message);
            break;
          case 'peer-disconnected':
            console.log('Peer disconnected:', message.peerId);
            break;
          default:
            console.error('Unknown message type:', message.type);
        }
      };

      signalingRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      signalingRef.current.onclose = () => {
        setIsLoading(true); // Set loading to true if connection closes
        console.log('WebSocket connection closed.');
      };

      return () => {
        signalingRef.current?.close();
      };
    };

    initWebRTC();

  }, [name, room]);

  const handleIncomingMessage = (message: any) => {
    if (message.sender !== name) {
      setMessages(prevMessages => [...prevMessages, { sender: message.sender, content: message.content }]);
    }
  };

  const handleExit = () => {
    if (peerId) {
      signalingRef.current?.send(JSON.stringify({
        type: 'peer-disconnected',
        room,
        peerId
      }));
    }
    signalingRef.current?.close(); // Close the WebSocket connection
    router.push('/'); // Redirect to home page
  };

  const sendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = { sender: name, content: inputMessage.trim() };
      setMessages(prevMessages => [...prevMessages, newMessage]);

      signalingRef.current?.send(JSON.stringify({
        type: 'chat-message',
        ...newMessage,
        room
      }));

      setInputMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      ) : (
        <Card className="flex-grow m-4 overflow-hidden">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Chat Room: {room}</CardTitle>
            <Button onClick={handleExit} variant="destructive" className="ml-4">Exit</Button>
          </CardHeader>
          <CardContent className="overflow-y-auto h-[calc(100%-8rem)]">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.sender === name ? 'text-right' : 'text-left'}`}>
                <span className="font-bold">{msg.sender}: </span>
                {msg.content}
              </div>
            ))}
          </CardContent>
          <CardFooter className="border-t">
            <div className="flex w-full space-x-2">
              <Input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-grow"
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
