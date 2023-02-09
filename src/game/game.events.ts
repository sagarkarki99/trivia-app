import { Admin, ActiveUser } from 'src/entities/user';
import { QuestionPayload } from 'src/gateway/inputs';
import { Answer } from './game';

export enum GameEvent {
  questionAsked = 'questionAsked',
  newAnswer = 'newAnswer',
  leaveGame = 'leaveGame',
  newUserJoined = 'newUserJoined',
  finish = 'finish',
}

export class QuestionAskedResponseEvent {
  users: ActiveUser[];
  payload: QuestionPayload;
}

export class NewAnswerResponseEvent {
  admin: Admin;
  answer: Answer;
}
export class BroadcastResponseEvent {
  users: ActiveUser[];
  payload: any;
}
