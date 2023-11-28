import express, { Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';

// ***************************************** LIBRARIES ***************************************
import { whatsAppVerify, whatsAppRetreiveMessage } from '@libs/whats-app';

import { gptChatResponse } from '@libs/gpt';

// ************************************************************************************************
// ************************************************************************************************
// ***************************************** SERVER SETUP *****************************************

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
  res.send({ message: 'Hello API' });
});

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

// ************************************************************************************************
// ************************************************************************************************
// ***************************************** REST ENDPOINTS ***************************************

app.get('/webhooks', (req: Request, res: Response) => {
  whatsAppVerify(req, res);
});
app.post('/webhooks', async (req: Request, res: Response) => {
  // This webhook listens to incoming messages from the user
  const text: string | null = whatsAppRetreiveMessage(req, res);

  if (text) {
    // Step 1: Trigger GPT4
    await gptChatResponse(text);
    // Step 2: fire response here
  }
});
