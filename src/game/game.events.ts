import { QuestionPayload, AnswerPayload } from './game';
import { ActiveUser, Admin } from './trivia.pool';

export enum GameEvent {
  questionAsked = 'questionAsked',
  newAnswer = 'newAnswer',
  leaveGame = 'leaveGame',
  newUserJoined = 'newUserJoined',
}

export class QuestionAskedEvent {
  admin: Admin;
  users: ActiveUser[];
  question: QuestionPayload;
}

export class NewAnswerEvent {
  admin: Admin;
  userId: string;
  answer: AnswerPayload;
}
export class BroadcastEvent {
  users: ActiveUser[];
  payload: any;
}
