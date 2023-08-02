import { marshall } from "@aws-sdk/util-dynamodb";
import * as uuid from 'uuid';
import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import type { NextApiRequest, NextApiResponse } from 'next'


const client = new DynamoDBClient({});

type RequestData = {
    id: string,
    project_id: string,
    config_id: string,
    group_id: string,
    message_id: string,
    user: string,
    key: string,
    score: number,
    comment: string,
    feedback_source: string,
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const { groupId, messageId, user, key, score, comment } = req.body;
    const uuId = uuid.v4()
    const Item = {
        id: uuId,
        projectId: "proj_657a6e9b",
        configId: "4b3c7c25-a9cc-4ad2-9019-f765fc2af3ff",
        groupId,
        messageId,
        user,
        key,
        score,
        comment,
        feedback_source: "API",
    };
    console.log(Item)

    try {
      await client.send(
        new PutItemCommand({
          TableName: "Feedback",
          Item: marshall(Item),
        })
      );
  
      return res.status(200).json({ uuid: uuId });
    } catch (error) {
      console.error('Error occurred while writing to DynamoDB:', error);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
}
