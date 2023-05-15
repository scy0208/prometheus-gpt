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
    const domain = process.env.NEXT_PUBLIC_EMAIL_DOMAIN;
    const currentTime = new Date();
    const Item = {
        uuid: uuid.v4(),
        conversation,
        username,
        domain,
        time: currentTime.toISOString(),
        content: message
    };
    client.send(
        new PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: marshall(Item),
        })
    )
    return res.status(200)
}
