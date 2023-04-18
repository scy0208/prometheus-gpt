import { OpenAIStream, OpenAIStreamPayload } from '@/utils/OpenAIStream'

type RequestData = {
  message: string
}

export const config = {
    runtime: 'edge',
}

export default async function POST(request: Request) {
  const { message } = (await request.json()) as RequestData

  if (!message) {
    return new Response('No message in the request', { status: 400 })
  }

  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: message }],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 1000,
    stream: true,
    n: 1,
  }

  const stream = await OpenAIStream(payload)
  return new Response(stream)
}