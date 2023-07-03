import type { NextFetchEvent } from 'next/server'
import { ChatOpenAI } from "langchain/chat_models/openai";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { RequestCookies } from "@edge-runtime/cookies";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HumanChatMessage, SystemChatMessage, AIChatMessage, BaseChatMessage} from "langchain/schema";
import { Message } from '@/types';
import { BufferMemory,ChatMessageHistory } from 'langchain/memory';
import { ChainTool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { BaseCallbackHandler } from "langchain/callbacks";
import { OpenAI } from "langchain/llms/openai";
import { DynamicTool } from "langchain/tools";

type RequestData = {
    message: string;
    dialogues: Message[]
  }

export const runtime = 'edge';

  
const systemChatMessage: SystemChatMessage = new SystemChatMessage(
    `You have two identities: a master sommelier and a digit agent of Alpha Omega Winery. Based on user's instruction, 
    please decide your identy and corresponse responses, your response should be in a short, clear, and plain language like explaining to your grandma,
    and keep your every response in 80 words.

    If You are a master sommelier, please specify user's preference and use inventory list to provide wine recommendations in Napa. Here are the steps you need to do:
    Firstly, if you don't have enough information please ask simple and plain questions to clarify their needs as much as possible, you don't need region information.
    Secondly, once you believe you have enough user preference infomation, awalys use tool to get the inventory list before any recommendation to make sure what you recommend is in the inventory.
    Thirdly, recommend one wine each time, and give clear and short reasons and tasting notes in bullet ponits
    Finally, use tool to search latest purchase info of that specific wine you just recommend and create a table to list the results from the tool, listing the thumbnail_image, name, price, link.
    Respond using markdown and strong the wine name you mention. 
    
    If You are a digit agent of Alpha Omega Winery please search the winery source knowdge before answer the question, don't try to make up an answer
  `)

export function mapDialogue(dialogue: Message):BaseChatMessage {
    
    if (dialogue.role === "user") {
        return new HumanChatMessage(dialogue.content)
    } else if (dialogue.role === "assistant") {
        return new AIChatMessage(dialogue.content)
    } else {
        return new SystemChatMessage(dialogue.content)
    }
}

export function creaetClient() {
    const cookies = new RequestCookies(new Headers()) as any;
    return createRouteHandlerClient<any>(
        { cookies: () => cookies },
        {
            supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        }  
    )
}

export async function search_wine_purchase_info(wineName: string) {
    try {
        const supabase = creaetClient()
        const wines = await supabase.from('wine_product')
            .select(`url, price, description, image_link`)
            .eq('wine_name', wineName)
        return JSON.stringify(wines.data);
    } catch (error) {
      // Handle errors that occurred during the API request
      console.error("An error occurred while fetching the purchase link:", error);
      return JSON.stringify([]);
    }
  }

  export async function get_inventory_wine_price_list() {
    try {
        const supabase = creaetClient()
        const wines = await supabase.from('wine_product')
            .select(`wine_name, price`)
      return JSON.stringify(wines.data);
    } catch (error) {
      // Handle errors that occurred during the API request
      console.error("An error occurred while fetching the purchase link:", error);
      return JSON.stringify([]);
    }
  }

export function createMemory(dialogues: Message[]):BufferMemory {
    dialogues.pop()
    const chatMessages = dialogues.map((dialogue: Message) => mapDialogue(dialogue))
    chatMessages.unshift(systemChatMessage);
    console.log(chatMessages)

    return new BufferMemory({
        chatHistory: new ChatMessageHistory(chatMessages),
        memoryKey: 'chat_history',
        returnMessages: true
    })
}

export default async function POST(req: Request, event: NextFetchEvent) {
    const { message, dialogues } = (await req.json()) as RequestData
    console.log("Log request")
    console.log(message)
    console.log(dialogues)

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const supabase = creaetClient()
    const handler = BaseCallbackHandler.fromMethods({
        // handleLLMStart() {
        //     res.write("Thinking...")
        // },
        handleLLMNewToken: async (token: string) => {
            await writer.ready;
            await writer.write(encoder.encode(token));
          },
        handleAgentEnd: async () => {
            await writer.ready;
            await writer.close();
          },
        handleLLMError: async (e: Error) => {
            await writer.ready;
            await writer.abort(e);
          },
      });

    const model = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        streaming: true,
        modelName: "gpt-4-0613",
        temperature: 0,
      });

    const QAmodel = new OpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-3.5-turbo-0613",
        temperature: 0,
    });

    const supabaseVectorStore = await SupabaseVectorStore.fromExistingIndex(
        new OpenAIEmbeddings(),
        {
            client: supabase,
            tableName: "documents",
            queryName: "match_documents_js"
        }
    )

    const chain = new RetrievalQAChain({
        combineDocumentsChain: loadQAStuffChain(QAmodel),
        retriever: supabaseVectorStore.asRetriever(),
    })

    const qaTool = new ChainTool({
        name: "winery-source-knowledge",
        description:
          "Winery QA - useful for when you need to provide information about the winery.",
        chain: chain,
      });
    
    const tools = [
        qaTool,
        new DynamicTool({
            name: "search_wine_purchase_info",
            description:
              "You can use this tool to get purchase info of a wine",
              func: async (wineName) => {
                return await search_wine_purchase_info(wineName);
              },
          }),
          new DynamicTool({
            name: "get_inventory_wine_price_list",
            description:
              "You can use this tool to get inventory list",
              func: async () => {
                return await get_inventory_wine_price_list();
              },
          })
    ];

    const executor = await initializeAgentExecutorWithOptions(tools, model, {
        agentType: "openai-functions",
        verbose: true,
        memory: createMemory(dialogues),
      });
    
    executor.call({
            input: message, 
         },
         [handler]
    );

    return new Response(stream.readable, {
        headers: { 'Content-Type': 'text/event-stream' },
    });
}

