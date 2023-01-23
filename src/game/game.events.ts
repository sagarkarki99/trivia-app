import { Admin, ActiveUser } from 'src/entities/user';
import { QuestionPayload, AnswerPayload } from './game';

export enum GameEvent {
  questionAsked = 'questionAsked',
  newAnswer = 'newAnswer',
  leaveGame = 'leaveGame',
  newUserJoined = 'newUserJoined',
  finish = 'finish',
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
