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

  const slicedDialogues = dialogues //.slice(Math.max(dialogues.length - 7, 0))

  const systemSetting = { 
    role: "system", 
    content: "You are a sommelier providing wine recommendation \
    based on users budget and preference. Your response should be in a short, clear, \
    plain language like explaiing to your grandma and keep the response in 200 words. Please use the Socratic method \
    to let users answer the right questions to clarify their needs. Respond using markdown and strong the wine name you mention.\
    " }
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