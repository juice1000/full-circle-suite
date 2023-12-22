import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';

export const messageSchema: CreateTableCommandInput = {
  AttributeDefinitions: [
    {
      AttributeName: 'userId',
      AttributeType: 'S',
    },
    { AttributeName: 'created', AttributeType: 'N' },
  ],
  KeySchema: [
    {
      AttributeName: 'userId',
      KeyType: 'HASH',
    },
    { AttributeName: 'created', KeyType: 'RANGE' },
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
    { AttributeName: 'created', AttributeType: 'N' },
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH',
    },
    { AttributeName: 'created', KeyType: 'RANGE' },
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
    { AttributeName: 'created', AttributeType: 'N' },
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH',
    },
    { AttributeName: 'created', KeyType: 'RANGE' },
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
      AttributeName: 'userId',
      AttributeType: 'S',
    },
    { AttributeName: 'created', AttributeType: 'N' },
  ],
  KeySchema: [
    {
      AttributeName: 'userId',
      KeyType: 'HASH',
    },
    { AttributeName: 'created', KeyType: 'RANGE' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  TableName: 'full-circle-selected-training-data',
};

export const guidedExerciseSchema: CreateTableCommandInput = {
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S',
    },
    { AttributeName: 'created', AttributeType: 'N' },
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH',
    },
    { AttributeName: 'created', KeyType: 'RANGE' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  TableName: 'full-circle-guided-exercises',
};
