import { OpenAIStream, OpenAIStreamPayload } from '@/utils/OpenAIStream'
import {v4 as uuidv4} from "uuid"
import { Client } from 'llm-feedback-client'

type RequestData = {
  dialogues: { role: string, content: string }[]
}

export const config = {
    runtime: 'edge',
}

const feedbackClient = new Client({
  projectId: 'proj_657a6e9b',
  apiKey: 'YOUR_API_KEY'
});

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
    content: "You are ChatGPT, a helpful assistant, please follow user instructions and response in markdown."
  }

  const temperature = 0.7
  const model = process.env.OPENAI_GPT_MODEL || "gpt-3.5-turbo"

  const configName = "VERSION_2023-08-15"

  // await feedbackClient.registerConfig({
  //   configName, 
  //   config: {
  //     model,
  //     systemSetting,
  //     temperature
  //   } 
  // })

  slicedDialogues.unshift(systemSetting);

  const payload: OpenAIStreamPayload = {
    model,
    messages: slicedDialogues,
    temperature,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 1000,
    stream: true,
    n: 1,
  }

  console.log(payload)

  const stream = await OpenAIStream(payload)
  return new Response(stream)
}