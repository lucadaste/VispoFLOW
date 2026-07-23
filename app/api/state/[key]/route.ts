import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { userState } from "@/lib/db-schema"
import { STORAGE_KEYS } from "@/lib/storage-keys"

const VALID_KEYS: string[] = Object.values(STORAGE_KEYS)

export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { key } = await params
  if (!VALID_KEYS.includes(key)) return NextResponse.json({ error: "Unknown key" }, { status: 400 })

  const [row] = await db
    .select()
    .from(userState)
    .where(and(eq(userState.userId, userId), eq(userState.key, key)))
    .limit(1)

  return NextResponse.json({ value: row?.value ?? null, updatedAt: row?.updatedAt ?? null })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { key } = await params
  if (!VALID_KEYS.includes(key)) return NextResponse.json({ error: "Unknown key" }, { status: 400 })

  const body = await req.json()

  await db
    .insert(userState)
    .values({ userId, key, value: body.value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [userState.userId, userState.key],
      set: { value: body.value, updatedAt: new Date() },
    })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { key } = await params
  if (!VALID_KEYS.includes(key)) return NextResponse.json({ error: "Unknown key" }, { status: 400 })

  await db.delete(userState).where(and(eq(userState.userId, userId), eq(userState.key, key)))

  return NextResponse.json({ ok: true })
}
