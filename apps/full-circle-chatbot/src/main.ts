import express, { Request, Response } from 'express';
import session from 'express-session';
import { messageProcessor } from './controllers/controller-whatsapp';
import { v4 as uuidv4 } from 'uuid';
import {
  extractSignupUserInformation,
  writeSystemPrompt,
} from '@libs/dynamo-db';

// ***************************************** NX LIBRARIES ***************************************

import {
  initializeDB,
  createExercise,
  getExercise,
  createUser,
  User,
} from '@libs/dynamo-db';
// import { deleteTables } from '@libs/dynamo-db';
import { whatsAppVerify } from '@libs/whats-app';
import { exampleSystemPrompt } from '@libs/gpt';

// deleteTables();
initializeDB();

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
  try {
    await messageProcessor(req, res);
  } catch (err) {
    console.error(err);
    res.sendStatus(400);
  }
});

// TODO: this function is still in the making and only for demo purposes
app.post('/create-user', async (req: Request, res: Response) => {
  // TODO: create user profile after signup
  console.log('create user');
  const userInfo = req.body;
  // console.log(userInfo);
  if (userInfo) {
    const user = extractSignupUserInformation(userInfo.form_response);
    console.log(user);
    await createUser(user);
  }

  res.sendStatus(200);
});

// TODO: this function is still in the making and only for demo purposes
app.get('/create-demo-user', async (req: Request, res: Response) => {
  // TODO: create user profile after signup
  console.log('create demo user');

  const user: User = {
    id: uuidv4(),
    firstname: 'Grace',
    lastname: 'Zhu',
    role: 'mother',
    birthdate: new Date('1996-04-25'),
    created: new Date(),
    archeType: 'hard-working',
    phone: '6583226020',
    email: '',
    numberOfChildren: 2,
    stressScore: 2,
    parentingConcerns: 'sleep, freetime',

    infantFirstName: 'Bubu',
    infantBirtdate: '',
    infantCharacteristics: 'anxious, distracted',

    introduction: '',
    initialIntroduction: '',
    exerciseMode: false,
    exerciseName: '',
    exerciseStep: 0,
    exerciseLastParticipated: new Date(),
    subscriptionStartDate: new Date(),
    subscriptionEndDate: null,
  };
  await createUser(user);

  res.sendStatus(200);
});

app.get('/create-exercise', async (req, res) => {
  // TODO: create exercises through admin panel
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
  const existingExercise = await getExercise(name);
  if (!existingExercise) {
    await createExercise(name, steps, questions);
  } else {
    console.error('exercise already exists');
  }

  res.sendStatus(200);
});

app.get('/create-system-prompt', async (req, res) => {
  // TODO: create system prompts through admin panel
  console.log('create system prompt');
  const prompt = exampleSystemPrompt;
  await writeSystemPrompt(prompt);
  res.sendStatus(200);
});
