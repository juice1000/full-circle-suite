import { Request, Response } from 'express';
import { sendUserMessage, whatsAppRetreiveMessage } from '@libs/whats-app';
import {
  gptChatResponse,
  gptExerciseResponse,
  interpretStressLevel,
} from '@libs/gpt';
import {
  getUser,
  createUser,
  writeUser,
  createMessage,
  getMessages,
  Message,
  getExercise,
} from '@libs/dynamo-db';

export async function messageProcessor(req: Request, res: Response) {
  // Extract whats app user information
  const message = await whatsAppRetreiveMessage(req, res);

  if (message) {
    const phone = message.from;
    const messageText = message.text.body;

    // Retrieve user profile
    let user = await getUser(phone);
    let messageHistory: Message[] = null;
    let gptResponse: string = '';

    if (!user) {
      // Create new user if doesn't exist
      user = await createUser(phone);
      // Trigger GPT-model
      gptResponse = await gptChatResponse(messageText);
    } else {
      // Retrieve chat history
      messageHistory = await getMessages(user.id);
      // Check if user in exercise mode
      if (user.exerciseMode) {
        const exercise = await getExercise(user.exerciseName);
        if (user.exerciseStep + 1 < exercise.steps) {
          gptResponse = await gptExerciseResponse(
            messageText,
            messageHistory,
            user,
            exercise
          );
        } else {
          user.exerciseMode = false;
          user.exerciseName = '';
          user.exerciseStep = 0;
          gptResponse = await gptChatResponse(
            messageText,
            messageHistory,
            user
          );
        }
      } else {
        // Trigger GPT-model with chat history and user data
        gptResponse = await gptChatResponse(messageText, messageHistory, user);
      }
    }

    // Store new message Object in DB
    createMessage(user.id, messageText, gptResponse);
    // Send message to user
    sendUserMessage(phone, gptResponse);
    // Elaborate on the stress level
    await interpretStressLevel(user, messageText, messageHistory);

    if (user.stressScore < -0.5) {
      // Initiate stress exercise
      user.exerciseMode = true;
      user.exerciseName = 'mental-distress';
      user.exerciseStep = 0;
      const exercise = await getExercise(user.exerciseName);
      sendUserMessage(phone, exercise.questions[0]);
    }
    // Update User in database
    writeUser(user);

    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
}
