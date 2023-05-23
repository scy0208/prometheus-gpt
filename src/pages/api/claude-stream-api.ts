import { ClaudeStream, ClaudeStreamPayload, convertOpenAIMessagesToAnthropicMessages } from '@/utils/ClaudeStream'


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

  const slicedDialogues = dialogues.slice(Math.max(dialogues.length - 7, 0))

  const systemSetting = { 
    role: "system", 
    content: "You are Claude, a large language model trained by Anthropic. Follow the user's instructions carefully. Respond using markdown." 
  }
  slicedDialogues.unshift(systemSetting);

  const prompt = convertOpenAIMessagesToAnthropicMessages(slicedDialogues)

  const payload: ClaudeStreamPayload = {
    model: "claude-v1",
    prompt,
    max_tokens_to_sample: 1000,
    stop_sequences: ["\n\nHuman:"],
    stream: true
  }

  const stream = await ClaudeStream(payload)
  return new Response(stream)
}