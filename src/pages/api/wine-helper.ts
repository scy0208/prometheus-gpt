import type { NextApiRequest, NextApiResponse } from 'next'
import { ChatOpenAI } from "langchain/chat_models/openai";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { TypeORMVectorStore } from "langchain/vectorstores/typeorm";
import { DataSourceOptions } from "typeorm";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HumanChatMessage, SystemChatMessage, AIChatMessage, BaseChatMessage} from "langchain/schema";
import { Message } from '@/types';
import { BufferMemory,ChatMessageHistory } from 'langchain/memory';
import { ChainTool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { BaseCallbackHandler } from "langchain/callbacks";
import { OpenAI } from "langchain/llms/openai";
import { DynamicTool } from "langchain/tools";
import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: 5432, // or your PostgreSQL port number
    ssl: true
  });

  
const systemChatMessage: SystemChatMessage = new SystemChatMessage(
    `You have two identities: a master sommelier and a digit agent of Alpha Omega Winery. Based on user's instruction, 
    please decide your identy and corresponse responses, your response should be in a short, clear, and plain language like explaining to your grandma,
    and keep the response in 100 words.

    If You are a master sommelier, please use inventory list to provide wine recommendations based on users' preference.
    You should awalys use tool to get the inventory list before any recommendation to make sure what you recommend is in the inventory.
    Please let users answer the right questions to clarify their needs as much as possible. Respond using markdown and strong the wine name you mention. 
    After you have enough information, please first recommend ONE specific wine each time and give your reason. 
    Then, use tool to search latest purchase info of that specific wine you just recommend, ALWAYS search and NEVER GUESS them. 
    Finally create a table to list the results from the tool, listing the thumbnail_image, name, price, link.

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

export async function search_wine_purchase_info(wineName: string) {
    try {
  
      const client = await pool.connect();
  
      const query = 'SELECT url, price, description, image_link FROM wine_product WHERE wine_name = $1';
      const values = [wineName];
      const result = await client.query(query, values);
  
      const wine = result.rows[0];
      client.release();
  
      return JSON.stringify([wine]);
    } catch (error) {
      // Handle errors that occurred during the API request
      console.error("An error occurred while fetching the purchase link:", error);
      return JSON.stringify([]);
    }
  }

  export async function get_inventory_list() {
    try {
      const client = await pool.connect();
  
      const query = 'SELECT wine_name FROM wine_product';
      const result = await client.query(query);
  
      const wineNames = result.rows.map(product => product.wine_name);
      client.release();
  
      return JSON.stringify(wineNames);
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

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    const { message, dialogues } = req.body

    const args = {
        postgresConnectionOptions: {
          type: "postgres",
          host: process.env.PGHOST,
          port: 5432,
          username: process.env.PGUSER,
          password: process.env.PGPASSWORD,
          database: process.env.PGDATABASE,
          ssl: true
        } as DataSourceOptions,
        verbose: false,
      };

    const typeormVectorStore = await TypeORMVectorStore.fromDataSource(
        new OpenAIEmbeddings(),
        args
    );

    const handler = BaseCallbackHandler.fromMethods({
        handleLLMStart() {
            res.write("Thinking...")
        },
        handleLLMNewToken(token) {
            res.write(token)
        },
        handleLLMEnd() {
            res.write("\n\n")
        },
      });

    const model = new ChatOpenAI({
        streaming: true,
        modelName: "gpt-4-0613",
        temperature: 0,
        //callbacks: [handler]
      });

    const QAmodel = new OpenAI({
        modelName: "gpt-4-0613",
        temperature: 0,
    });

    const chain = new RetrievalQAChain({
        combineDocumentsChain: loadQAStuffChain(QAmodel),
        retriever: typeormVectorStore.asRetriever(),
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
            name: "get_inventory_list",
            description:
              "You can use this tool to get inventory list",
              func: async () => {
                return await get_inventory_list();
              },
          })
    ];

    const executor = await initializeAgentExecutorWithOptions(tools, model, {
        agentType: "openai-functions",
        verbose: false,
        memory: createMemory(dialogues),
      });
    
    const result = await executor.call({
            input: message, 
         },
         [handler]
    );
    res.end()
}