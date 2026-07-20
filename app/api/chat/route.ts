import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const anthropic = new Anthropic()

const SYSTEM = `You are Vispo, an AI legal assistant that helps founders incorporate their companies and stay compliant. You specialize in Delaware C-Corp formation, founder agreements, equity structures, cap tables, EIN applications, 83(b) elections, state qualifications, and securities filings.

Be concise, practical, and friendly. When explaining legal concepts, use plain language. Always remind users to consult a licensed attorney for advice specific to their situation.`

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const stream = anthropic.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    system: SYSTEM,
    messages,
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }
      controller.close()
    },
    cancel() {
      stream.abort()
    },
  })

  return new NextResponse(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
