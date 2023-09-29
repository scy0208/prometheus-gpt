import { OpenAIStream, OpenAIStreamPayload } from '@/utils/OpenAIStream'
import {v4 as uuidv4} from "uuid"
import { Client } from 'llm-feedback-client'

type RequestData = {
  dialogues: { role: string, content: string }[]
  message: string
}

export const config = {
    runtime: 'edge',
}

const feedbackClient = new Client({
  projectId: 'proj_w64QXgkCled9jD2PDy1lD',
  apiKey: 'YOUR_API_KEY'
});

interface TopicDescription {
  [key: string]: string;
}

const topics_with_description: TopicDescription = {
  "Unsolicited Ads": "Emails containing unsolicited advertisements.",
  "Vendor Emails": "Service emails from the vendor, including confirmations, notifications, newsletters, updates, and automated messages.",
  "First-Time Refund": "Customers request a refund for the first time without exploring alternatives.",
  "Persistent Refund": "Customers continue to request a refund after exploring alternatives in previous emails.",
  "Shipping Mistake": "Customers complain that the received order differs from what they ordered.",
  "Positive Reviews": "Customers provide positive feedback or reviews.",
  "Complain Size Fit": "Customers provide negative feedback regarding the size fit of the product.",
  "Complain Quality": "Customers provide negative feedback regarding the quality of the product.",
  "Complain Design": "Customers provide negative feedback regarding the design of the product.",
  "Other Negative Reviews": "Customers provide negative feedback for reasons other than size, quality, or design.",
  "Shipping Query": "Customers inquire about the status of their shipment.",
  "Order Cancel": "Customers request to cancel their order.",
  "Order Info Update": "Customers request updates to order information such as size, style, address, or applying a promo code.",
  "Engagement Incentive": "Customers request incentives for engaging with the brand on social media.",
  "Other Customer Support": "Topics that don't fit into any of the existing customer support categories.",
  "Unpaid KOL Collaboration": "Key Opinion Leaders (KOLs) agree to collaborate without additional fees.",
  "Paid KOL Collaboration": "KOLs decline to collaborate without additional fees or ask for them.",
  "KOL Package Received": "KOLs confirm receipt of the package after agreeing to collaborate.",
  "KOL Content Commitment": "KOLs commit to posting content in future on social media featuring the product.",
  "KOL Content Published": "KOLs confirm that they have published the content on social media featuring the product.",
  "KOL Promo Code": "KOLs request a promo code for their followers.",
  "Other KOL Topics": "Topics related to KOLs that don't fit into any of the existing categories."
}


function format_system_prompt(topic_description: TopicDescription, email: string): string {
  return `
  You are an email label assistant helping an e-commerce team to label a given email.
  An email contains the main message and the quoted thread (the part begin with \`>\` which can help you understand the context of the email).
  You will be given a list of topics and their descriptions. 
  Please first review and understand the email and the context, compare the main message (not the context) with each description, and select the most relevant topic(s), minimizing the number of topics selected.
  Your output should be in a list of JSON object of fields: topic, confidence_score (0-1), and reason, sorted by confidence_score DESC, and using markdown.
  \n\nHere is the topic-description list:\n ${JSON.stringify(topic_description, null, 2)}
  \n\nHere is the email:\n ${email}
  `;
}

function needs_processing(email: string): boolean {
  return !email.includes("\n>") && (email.includes("wrote:") || email.includes("From:"));
}

function reformat_email(email_content: string): string {
  if (!needs_processing(email_content)) {
      return email_content;
  }

  const lines = email_content.trim().split("\n");

  // Identify the first message (and its metadata) in the email chain
  let metadata_end = 0;
  for (let idx = 0; idx < lines.length; idx++) {
      if (lines[idx].trim() === "") {
          metadata_end = idx;
          break;
      }
  }

  // Start the reformatted email with the initial metadata and message
  let reformatted = lines.slice(0, metadata_end + 1).join("\n");

  // Handle the email thread content with different indentation levels
  let depth = 0;
  for (let i = metadata_end + 1; i < lines.length; i++) {
      const stripped = lines[i].trim();

      // Identify change of sender
      if (stripped.startsWith("On ") && stripped.includes("wrote:")) {
          depth++;
          reformatted += "\n" + ">".repeat(depth) + " " + stripped;
      }
      // Skip redundant lines and separators
      else if (!stripped || stripped.startsWith("--")) {
          continue;
      } else {
          reformatted += "\n" + ">".repeat(depth) + " " + stripped;
      }
  }

  return reformatted;
}

export default async function POST(request: Request) {
  const { dialogues, message } = (await request.json()) as RequestData

  console.log(dialogues)

  if (!dialogues || dialogues.length===0) {
    console.log("dialogues empty");
    return new Response('No message in the request', { status: 400 })
  }

  const systemSetting = { 
    role: "system", 
    content: format_system_prompt(topics_with_description, "")
  }

  const messages = [
    systemSetting,
    { role: "user", content: reformat_email(message) },
  ]


  const temperature = 0
  const model = "gpt-4-0613"

  const configName = "Email_Classification_20230928"

  await feedbackClient.registerConfig({
    configName, 
    config: {
      model,
      systemSetting,
      temperature
    } 
  })

  const payload: OpenAIStreamPayload = {
    model,
    messages,
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