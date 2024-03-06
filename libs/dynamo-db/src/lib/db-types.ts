export interface Message {
  id: string;
  userId: string;
  created: Date;
  userMessage: string;
  gptResponse: string;
  gptModel: string;
}

export interface User {
  id: string;
  created: Date;
  phone: string;
  stressScore: number;
  exerciseMode: boolean;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date | null;
  firstname: string;
  children: Child[];
  introduction: string;
  initialIntroduction: string;
  archeType: string;
  role: string;
  parentingConcerns: string;
  birthdate: Date | null;
  numberOfChildren: number;
  exerciseLastParticipated: Date;
  email: string;
  lastname?: string;
  exerciseName?: string;
  exerciseStep?: number;
}

export interface Child {
  name: string;
  birthdate: Date;
  sensitivity: string;
}

export interface GPTSystemPrompt {
  id: string;
  created: Date;
  prompt: string;
  currentlySelected: boolean;
}

export interface GPTModel {
  id: string;
  currentlySelected: boolean;
}

export interface SelectedTrainingData {
  id: string;
  userId: string;
  created: Date;
  userMessage: string;
  gptResponse: string;
  gptModel: string;
}

export interface GuidedExercise {
  id: string;
  created: Date;
  exerciseName: string;
  steps: number;
  questions: string[];
}

export interface BotMessage {
  id: string;
  message: string;
}
