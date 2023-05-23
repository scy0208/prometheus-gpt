import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';

const PROMPT_SUFFIX = "IMPORTANT: Please respond in Markdown format when appropriate.";
const AI_PROMPT = "\n\nAssistant:"
const HUMAN_PROMPT="\n\nHuman:"

export function convertOpenAIMessagesToAnthropicMessages(messages: any) {
    let message = "";
    for (let i = 0; i < messages.length; i++) {
        const role = messages[i].role;
        const content = messages[i].content;
        if (role === "system") {
            message += `${HUMAN_PROMPT} ${content}. ${PROMPT_SUFFIX}`;
        }
        else if (role === "user") {
            message += `${HUMAN_PROMPT} ${content}`;
        } else if (role === "assistant") {
            message += `${AI_PROMPT} ${content}`;
        }

    }
    return message+`${AI_PROMPT}`;
}

export interface ClaudeStreamPayload {
  prompt: string;
  model: string;
  max_tokens_to_sample: number;
  stop_sequences: string[];
  stream: boolean
}

export async function ClaudeStream(payload: ClaudeStreamPayload) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
  
    let counter = 0;
  
    const res = await fetch('https://api.anthropic.com/v1/complete', {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': `${process.env.ANTHROPIC_API_KEY ?? ''}`,
      },
      method: 'POST',
      body: JSON.stringify(payload),
    });

    let text = '';
    let oldText = '';
  
    const stream = new ReadableStream({
      async start(controller) {
        // callback
        function onParse(event: ParsedEvent | ReconnectInterval) {
          if (event.type === 'event') {
            const data = event.data;
            // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
            if (data === '[DONE]') {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              text = json.completion || '';
              const queue = encoder.encode(text.replace(oldText, ''));
              //const queue = encoder.encode(text);
              controller.enqueue(queue);
              counter++;
              oldText = text
            } catch (e) {
              // maybe parse error
              controller.error(e);
            }
          }
        }
  
        // stream response (SSE) from OpenAI may be fragmented into multiple chunks
        // this ensures we properly read chunks and invoke an event for each SSE event stream
        const parser = createParser(onParse);
        // https://web.dev/streams/#asynchronous-iteration
        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      },
    });
  
    return stream;
  }




