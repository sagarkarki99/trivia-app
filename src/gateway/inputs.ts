import { User } from 'src/entities/user';
import { QuestionPayload, AnswerPayload } from 'src/game/game';

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
