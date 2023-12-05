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
  firstname?: string;
  lastname?: string;
  email?: string;
  birthdate?: Date;
  numberOfChildren?: number;
  introduction?: string;
  exerciseName?: string;
  exerciseStep?: number;
  exerciseLastParticipated?: Date;
}

export interface GPTSystemPrompts {
  id: string;
  created: Date;
  prompt: string;
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
