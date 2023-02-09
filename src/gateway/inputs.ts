import { User } from 'src/entities/user';

export class JoinGameInput {
  gameId: string;
  user: User;
}

export class AskQuestionInput {
  gameId: string;
  questionPayload: QuestionPayload;
}
export class AnswerQuestionInput {
  gameId: string;
  answer: AnswerPayload;
}

export class AnswerPayload {
  userAnswer: string;
  remainingSeconds: number;
}

export class QuestionPayload {
  question: string;
  answerOptions: string[];
  correctAnswer: string;
  totalSeconds: number;
}
