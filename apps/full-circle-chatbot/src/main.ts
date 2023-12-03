import express, { Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import { whatsAppVerify, helloWhatsApp } from '@libs/whats-app';
import { whatsAppWebhook } from './controller';

// ***************************************** NX LIBRARIES ***************************************

import { writeUser, initializeDB } from '@libs/dynamo-db';
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

// TODO: this function is still in the making and only for demo purposes
app.get('/create-user', async (req: Request, res: Response) => {
  // TODO: create user profile after signup
  console.log('create demo user');

  const userInfo = req.body;
  const user = {
    firstname: 'Julien',
    lastname: 'Look',
    birthdate: new Date('1996-04-25'),
    phone: '4917643209870',
    email: 'julienlook@gmx.de',
    numberOfChildren: 1,
    introduction:
      'Julien is a father in maternal leave. He takes care of his son with little help from his wife, because she mostly works overseas and rarely comes home. His son is very anxious and often cries.',
    stressScore: 0,
  };

  await writeUser(user);
  res.sendStatus(200);
});
