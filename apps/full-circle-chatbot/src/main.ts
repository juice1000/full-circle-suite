import express, { Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import { whatsAppVerify, helloWhatsApp } from '@libs/whats-app';
import { whatsAppWebhook } from './controller';

// ***************************************** NX LIBRARIES ***************************************

import { initializeDB } from '@libs/dynamo-db';
// import { deleteTables } from '@libs/dynamo-db';
// import { gptChatResponse } from '@libs/gpt';

// ************************************************************************************************
// ************************************************************************************************
// ***************************************** SERVER SETUP *****************************************
// deleteTables();
initializeDB();

const app = express();

// Session Middleware
const sessionMiddleware = session({
  secret: 'changeit',
  resave: true,
  saveUninitialized: true,
});
app.use(sessionMiddleware);

const corsOptions = {
  origin: process.env.CLIENT_URL,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

// Accept JSON Request and Response
app.use(express.json());
app.get('/', (req, res) => {
  res.send({ message: 'Hello from Server!' });
});

app.get('/test', (req, res) => {
  const message = helloWhatsApp();
  res.send({ message: message });
});

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

// ************************************************************************************************
// ************************************************************************************************
// ***************************************** REST ENDPOINTS ***************************************

app.get('/whatsapp-webhook', (req: Request, res: Response) => {
  // The Get request verifies the validity of the webhook
  whatsAppVerify(req, res);
});
app.post('/whatsapp-webhook', async (req: Request, res: Response) => {
  // This webhook listens to incoming messages from the user
  await whatsAppWebhook(req, res);
});
