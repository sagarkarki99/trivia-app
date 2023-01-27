import { Admin, ActiveUser } from 'src/entities/user';
import { QuestionPayload, Answer } from './game';

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
  answer: Answer;
}
export class BroadcastEvent {
  users: ActiveUser[];
  payload: any;
}
