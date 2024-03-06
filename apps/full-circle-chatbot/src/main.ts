import express, { Request, Response } from 'express';
import session from 'express-session';
import Stripe from 'stripe';
import { messageProcessor } from './controllers/controller-whatsapp';
// import { v4 as uuidv4 } from 'uuid';
import {
  extractSignupUserInformation,
  // getBotMessage,
  // writeBotMessage,
  // writeSystemPrompt,
} from '@libs/dynamo-db';

// ***************************************** NX LIBRARIES ***************************************

import {
  initializeDB,
  // createExercise,
  // getExercise,
  createUser,
  // User,
} from '@libs/dynamo-db';
// import { deleteTables } from '@libs/dynamo-db';
import { whatsAppVerify } from '@libs/whats-app';
import { stripeEventHandler } from './controllers/controller-stripe';
// import { exampleSystemPrompt } from '@libs/gpt';

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

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = new Stripe(process.env.STRIPE_API_KEY);
// Stripe Webhook (Needs to stand before the JSON middleware to be able to prepare the raw body)
app.post(
  '/stripe-webhook',
  express.raw({ type: 'application/json' }),
  (request: Request, response: Response) => {
    const sig = request.headers['stripe-signature'];
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    stripeEventHandler(event, stripe);
    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  }
);

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
    console.log('new user', user);
    await createUser(user);
  }

  res.sendStatus(200);
});

// // TODO: this function is still in the making and only for demo purposes
// app.get('/create-demo-user', async (req: Request, res: Response) => {
//   // TODO: create user profile after signup
//   console.log('create demo user');

//   const user: User = {
//     id: uuidv4(),
//     firstname: 'Grace',
//     lastname: 'Zhu',
//     role: 'mother',
//     birthdate: new Date('1996-04-25'),
//     created: new Date(),
//     archeType: 'hard-working',
//     phone: '6583226020',
//     email: '',
//     numberOfChildren: 2,
//     stressScore: 2,
//     parentingConcerns: 'sleep, freetime',

//     children: [],

//     introduction: '',
//     initialIntroduction: '',
//     exerciseMode: false,
//     exerciseName: '',
//     exerciseStep: 0,
//     exerciseLastParticipated: new Date(),
//     subscriptionStartDate: new Date(),
//     subscriptionEndDate: null,
//   };
//   await createUser(user);

//   res.sendStatus(200);
// });

// app.get('/create-exercise', async (req, res) => {
//   // TODO: create exercises through admin panel
//   console.log('create demo exercise');
//   const name = 'mental-distress';
//   const steps = 12;
//   const questions = [
//     `I understand you've been facing tough challenges recently. Can you share more about what specifically has been happening?`,
//     `Before we explore strategies, can you provide more details? Are there specific patterns or triggers you've noticed?`,
//     `Regarding hunger, how are the baby's feeding patterns during the day?`,
//     `Have you implemented any bedtime routine so far?`,
//     `Now, let's talk about your own sleep. How has it been for you during these challenging nights?`,
//     `Have you considered adjusting your sleeping space?`,
//     `Now, let's explore your emotional well-being. Have you noticed any changes in your mood or interest in activities you used to enjoy?`,
//     `Now, regarding your energy level, how has it been lately?`,
//     `Now, let me ask you two important questions: During the past month, have you often been bothered by feeling down, depressed, or hopeless?`,
//     `Another question: During the past month, have you often been bothered by having little interest or pleasure in doing things you normally enjoyed?`,
//     `Now, regarding nighttime routines, let's explore evidence-based strategies tailored to both the baby's needs and yours.`,
//     `There are professionals and evidence-based approaches available to assist you. Would you be open to exploring some options?`,
//   ];
//   const existingExercise = await getExercise(name);
//   if (!existingExercise) {
//     await createExercise(name, steps, questions);
//   } else {
//     console.error('exercise already exists');
//   }

//   res.sendStatus(200);
// });

// app.get('/create-system-prompt', async (req, res) => {
//   // TODO: create system prompts through admin panel
//   console.log('create system prompt');
//   const prompt = exampleSystemPrompt;
//   await writeSystemPrompt(prompt);
//   res.sendStatus(200);
// });

// app.get('/create-demo-bot-message', async (req, res) => {
//   const message = `Welcome <Name>! My name is Ria, your personal AI co-parent and coach. I'm here to bounce parenting ideas & tricks with you, deepen your knowledge on positive parenting, and support you through the hard times.
// Here are tips to get the most out of our chat:

// 💾Save me in your contacts as “Ria Parent Coach”
// 📌Pin our chat so you can always find me. On iPhone, swipe right on our chat in your inbox and select “Pin”. On Android, long press our chat in your inbox.
// 💡 If my initial response doesn't meet your needs, I encourage you to explain why to me. When you continue a conversation with me, I can provide more tailored advice & arrive at better solutions together with you!

// Alright, let's get back to it. How can I help?`;
//   await writeBotMessage('onboording-message', message);
//   res.sendStatus(200);
// });

// app.get('/get-demo-bot-message', async (req, res) => {
//   const d = await getBotMessage('onboording-message');
//   console.log(d);

//   res.sendStatus(200);
// });
