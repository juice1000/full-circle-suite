import express, { Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import axios from 'axios';

// ***************************************** NX LIBRARIES ***************************************
import {
  whatsAppVerify,
  whatsAppRetreiveMessage,
  helloWhatsApp,
} from '@libs/whats-app';
//import { initializeDB } from '@libs/dynamo-db';
// import { gptChatResponse } from '@libs/gpt';

// ************************************************************************************************
// ************************************************************************************************
// ***************************************** SERVER SETUP *****************************************

//initializeDB();

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

app.get('/webhooks', (req: Request, res: Response) => {
  whatsAppVerify(req, res);
});
app.post('/webhooks', async (req: Request, res: Response) => {
  // This webhook listens to incoming messages from the user
  const text: string | null = whatsAppRetreiveMessage(req, res);

  if (text) {
    // Step 1: Trigger GPT4
    //await gptChatResponse(text);
    // Step 2: fire axios response here
    const messageBody = {
      messaging_product: 'whatsapp',
      to: '4917643209870',
      text: {
        body: "Hi, I'm still in the making, but soon I'll be able to have a genuine conversation with you!",
      },
    };
    axios.post(
      'https://graph.facebook.com/v17.0/189035427616900/messages',
      messageBody,
      {
        headers: {
          Authorization:
            'Bearer EAAMaRZAL57xMBO96cjHipWyTzacWZB2EHlsXdcff5KbOnPOZBK1rXNljLarGtsC8kMLwnZBNPLk1gdSkn7WQ3qExzoRAmpG0F0gAO9atvtnksneMA9SZCZAd6kiiZCx7t331aJO8HzZAP8ZBE5aPiiBH56mkDHC6sTZC9QedR6MdAmfGhkAmuBzVKauZBQnxvjH6ACmFj3SHt2ZAaz9sIpH80PuG',
          'Content-Type': 'application/json',
        },
      }
    );
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});
