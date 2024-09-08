import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { NextRequest } from 'next/server';

const prisma = new PrismaClient();

// Define the Room type based on your Prisma schema
type Room = {
  id: string;
  name: string;
  participants: number;
};

export async function GET(): Promise<NextResponse<Room[] | { error: string }>> {
  try {
    const activeChats: Room[] = await prisma.room.findMany({
      where: {
        participants:{
            gt:0
        } ,
      },
    });
    console.log(activeChats)
    return NextResponse.json(activeChats);
  } catch (error) {
    console.error('Failed to fetch chat rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch chat rooms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<Room | { error: string }>> {
  try {
    const { room }: { room: string } = await request.json();

    const existingRoom = await prisma.room.findFirst({
      where: { name:room },
    });

    if (existingRoom) {
      const updatedRoom = await prisma.room.update({
        where: { id: existingRoom.id },
        data: { participants: { increment: 1 } },
      });
      return NextResponse.json(updatedRoom);
    } else {
      const newRoom = await prisma.room.create({
        data: { name: room, participants: 1 },
      });
      return NextResponse.json(newRoom);
    }
  } catch (error) {
    console.error('Failed to create/update chat room:', error);
    return NextResponse.json({ error: 'Failed to create/update chat room' }, { status: 500 });
  }
}