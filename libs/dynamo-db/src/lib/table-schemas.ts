import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';

export interface Message {
  id: string;
  userid: string;
  timestamp: Date;
  userMessage: string;
  gptResponse: string;
}

export interface User {
  id: string;
  timestamp: Date;
  phone: string;
  stressScore: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  age?: number;
  numberOfChildren?: number;
  introduction?: string;
}

export interface GPTSystemPrompts {
  id: string;
  timestamp: Date;
  prompt: string;
}

export interface SelectedTrainingData {
  id: string;
  userid: string;
  timestamp: Date;
  userMessage: string;
  gptResponse: string;
}

export const messageSchema: CreateTableCommandInput = {
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S',
    },
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH',
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  TableName: 'full-circle-messages',
};

export const userSchema: CreateTableCommandInput = {
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S',
    },
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH',
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  TableName: 'full-circle-users',
};

export const gptSystemPromptSchema: CreateTableCommandInput = {
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S',
    },
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH',
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  TableName: 'full-circle-gpt-system-prompts',
};

export const selectedTrainingDataSchema: CreateTableCommandInput = {
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S',
    },
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH',
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  TableName: 'full-circle-selected-training-data',
};
