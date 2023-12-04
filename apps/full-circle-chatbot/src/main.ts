import express, { Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import { whatsAppVerify } from '@libs/whats-app';
import { whatsAppWebhook } from './controller';

// ***************************************** NX LIBRARIES ***************************************

import { writeUser, initializeDB, createExercise } from '@libs/dynamo-db';
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
  //const userInfo = req.body;
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

app.get('/create-exercise', async (req, res) => {
  console.log('create demo exercise');
  const name = 'mental-distress';
  const steps = 12;
  const questions = [
    `I understand you've been facing tough challenges recently. Can you share more about what specifically has been happening?`,
    `Before we explore strategies, can you provide more details? Are there specific patterns or triggers you've noticed?`,
    `Regarding hunger, how are the baby's feeding patterns during the day?`,
    `Have you implemented any bedtime routine so far?`,
    `Now, let's talk about your own sleep. How has it been for you during these challenging nights?`,
    `Have you considered adjusting your sleeping space?`,
    `Now, let's explore your emotional well-being. Have you noticed any changes in your mood or interest in activities you used to enjoy?`,
    `Now, regarding your energy level, how has it been lately?`,
    `Now, let me ask you two important questions: During the past month, have you often been bothered by feeling down, depressed, or hopeless?`,
    `Another question: During the past month, have you often been bothered by having little interest or pleasure in doing things you normally enjoyed?`,
    `Now, regarding nighttime routines, let's explore evidence-based strategies tailored to both the baby's needs and yours.`,
    `There are professionals and evidence-based approaches available to assist you. Would you be open to exploring some options?`,
  ];

  await createExercise(name, steps, questions);
  res.sendStatus(200);
});
