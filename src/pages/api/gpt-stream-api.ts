import { OpenAIStream, OpenAIStreamPayload } from '@/utils/OpenAIStream'
import {v4 as uuidv4} from "uuid"

type RequestData = {
  dialogues: { role: string, content: string }[]
}

export const config = {
    runtime: 'edge',
}

export default async function POST(request: Request) {
  const { dialogues } = (await request.json()) as RequestData

  console.log(dialogues)

  if (!dialogues || dialogues.length===0) {
    console.log("dialogues empty");
    return new Response('No message in the request', { status: 400 })
  }

  const slicedDialogues = dialogues.slice(Math.max(dialogues.length - 7, 0))

  const systemSetting = { 
    role: "system", 
    content: "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown." 
  }
    slicedDialogues.unshift(systemSetting);

  const payload: OpenAIStreamPayload = {
    model: process.env.OPENAI_GPT_MODEL || "gpt-3.5-turbo",
    messages: slicedDialogues,
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