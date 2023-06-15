import { marshall } from "@aws-sdk/util-dynamodb";
import * as uuid from 'uuid';
import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import type { NextApiRequest, NextApiResponse } from 'next'


const client = new DynamoDBClient({});

type RequestData = {
    message: string
  }

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const { message, username, conversation } = req.body;
    const domain = 'ai-sommelier-gpt';
    const currentTime = new Date();
    const Item = {
        uuid: uuid.v4(),
        conversation,
        username,
        domain,
        time: currentTime.toISOString(),
        content: message
    };
    console.log(Item)
    try {
      await client.send(
        new PutItemCommand({
          TableName: process.env.TABLE_NAME,
          Item: marshall(Item),
        })
      );
  
      return res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Error occurred while writing to DynamoDB:', error);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
}
