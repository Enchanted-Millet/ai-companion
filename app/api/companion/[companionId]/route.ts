import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs'
import prismadb from '@/lib/prismadb'

export async function PATCH(req: Request, { params }: { params: { companionId: string } }) {
  try {
    const body = await req.json()
    const user = await currentUser()
    const { src, name, description, instructions, seed, categoryId } = body
    if (!params.companionId) {
      return new NextResponse('Missing companionId', { status: 400 })
    }

    if (!user || !user.id || !user.firstName) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    if (!src || !name || !description || !instructions || !seed || !categoryId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // TODO: check for subscription

    const companion = await prismadb.companion.update({
      where: {
        id: params.companionId,
        userId: user.id
      },
      data: {
        categoryId,
        userId: user.id,
        userName: user.firstName,
        src,
        name,
        description,
        instructions,
        seed
      }
    })

    return NextResponse.json(companion)
  } catch (e: any) {
    console.log('[COMPANION_POST]', e)
    return new NextResponse(e.message || 'Internal Error', { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { companionId: string } }) {
  try {
    const user = await currentUser()
    if (!params.companionId) {
      return new NextResponse('Missing companionId', { status: 400 })
    }

    if (!user || !user.id || !user.firstName) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const companion = await prismadb.companion.delete({
      where: {
        userId: user.id,
        id: params.companionId
      }
    })

    return NextResponse.json(companion)
  } catch (e: any) {
    console.log('[COMPANION_DELETE]', e)
    return new NextResponse(e.message || 'Internal Error', { status: 500 })
  }
}
