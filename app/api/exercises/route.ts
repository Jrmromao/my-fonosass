import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/app/db'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type')
    const difficulty = searchParams.get('difficulty')
    const phoneme = searchParams.get('phoneme')
    const ageRange = searchParams.get('ageRange')

    const where: any = {
      isPublic: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(type && { type }),
      ...(difficulty && { difficulty }),
      ...(phoneme && { phoneme: { contains: phoneme, mode: 'insensitive' } }),
      ...(ageRange && { ageRange })
    }

    const exercises = await prisma.activity.findMany({
      where,
      include: {
        files: true,
        categories: true,
        createdBy: {
          select: { fullName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: exercises })
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exercises' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, type, difficulty, phoneme, ageRange } = body

    const exercise = await prisma.activity.create({
      data: {
        name,
        description,
        type,
        difficulty,
        phoneme: phoneme || '',
        ageRange,
        isPublic: true,
        createdById: user.id
      },
      include: {
        files: true,
        categories: true,
        createdBy: {
          select: { fullName: true }
        }
      }
    })

    return NextResponse.json({ success: true, data: exercise })
  } catch (error) {
    console.error('Error creating exercise:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create exercise' },
      { status: 500 }
    )
  }
}
