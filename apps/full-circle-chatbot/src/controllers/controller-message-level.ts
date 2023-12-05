import {
  User,
  writeUser,
  createMessage,
  getMessages,
  Message,
} from '@libs/dynamo-db';
import { gptChatResponse } from '@libs/gpt';
import { sendUserMessage } from '@libs/whats-app';
import { Response } from 'express';
import {
  controllerExerciseRoute,
  evaluateStressLevel,
} from './controller-exercise-route';

export async function controllerMessageLevel(
  user: User,
  messageText: string,
  res: Response
) {
  let messageHistory: Message[] = null;
  let gptResponse: string = '';
  // Retrieve chat history
  messageHistory = await getMessages(user.id);

  // Check if same message is already in the database, could be we will receive the same request many times if an error occours inbetween
  const lastMessageThreshold = new Date(new Date().getTime() - 5 * 60 * 1000);
  if (
    messageHistory &&
    messageText === messageHistory[messageHistory.length - 1].userMessage && // Same message
    messageHistory[messageHistory.length - 1].created > lastMessageThreshold // Same message happened in the last 5min
  ) {
    console.error('Message has been previously sent to the server');
    res.sendStatus(200);
  } else {
    // Check if user in exercise mode
    if (user.exerciseMode) {
      gptResponse = await controllerExerciseRoute(
        user,
        messageText,
        messageHistory
      );
    } else {
      // Trigger GPT-model with chat history and user data
      gptResponse = await gptChatResponse(messageText, messageHistory, user);
    }

    // Store new message Object in DB
    createMessage(user.id, messageText, gptResponse);
    // Send message to user
    sendUserMessage(user.phone, gptResponse);

    if (!user.exerciseMode) {
      // TODO: run this in timely intervals, we don't need to evaluate stress level with every message
      await evaluateStressLevel(user, messageText, messageHistory);
    }
    // Update User in database
    writeUser(user);

    res.sendStatus(200);
  }
}
