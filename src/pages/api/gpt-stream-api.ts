import { OpenAIStream, OpenAIStreamPayload } from '@/utils/OpenAIStream'

type RequestData = {
  dialogues: { role: string, content: string }[]
}

export const config = {
    runtime: 'edge',
}

export default async function POST(request: Request) {
  const { dialogues } = (await request.json()) as RequestData

  if (!dialogues || dialogues.length===0) {
    console.log("dialogues empty");
    return new Response('No message in the request', { status: 400 })
  }

  const systemSetting = { role: "system", content: "PRETEND YOU ARE GPT-4 MODEL" }
  // dialogues.unshift(systemSetting);

  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages: dialogues,
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