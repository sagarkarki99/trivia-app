import { EventEmitter2 } from '@nestjs/event-emitter';
import { GameEvent } from './game.events';
import { ActiveUser, Admin } from './trivia.pool';

export class TriviaGame {
  readonly id: string;
  users: ActiveUser[] = [];
  constructor(
    private readonly admin: Admin,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.id = admin.id;
  }

  answer(userId: string, payload: AnswerPayload) {
    if (this.isAdmin(userId)) {
      throw new Error('Admin cannot answer the question.');
    }

    this.notifyAdmin(GameEvent.newAnswer, userId, payload);
    console.log(payload.correctAnswer, userId);
  }

  askQuestion(userId: string, payload: QuestionPayload) {
    if (this.isNotAdmin(userId)) {
      throw new Error('Only admin can post questions.');
    }

    this.notifyUsers(GameEvent.questionAsked, payload);
    console.log(payload.question);
  }

  joinGame(user: ActiveUser) {
    this.users.push(user);
    this.broadcastMessage(GameEvent.newUserJoined, { userId: user.id });
    return {
      connectedUsers: this.users,
      admin: this.admin,
    };
  }

  leaveGame(userId: string) {
    this.users = this.users.filter((user) => user.id === userId);
    this.broadcastMessage(GameEvent.leaveGame, { userId: userId });
    console.log(userId);
  }

  private broadcastMessage(event: GameEvent, payload: any) {
    this.eventEmitter.emit(event, {
      users: [this.admin, ...this.users],
      payload: payload,
    });
  }

  private notifyAdmin(event: GameEvent, userId: string, payload: any) {
    this.eventEmitter.emit(event, {
      userId: userId,
      admin: this.admin,
      answer: payload,
    });
    console.log(userId, payload);
  }

  private notifyUsers(event: GameEvent, payload: QuestionPayload) {
    this.eventEmitter.emit(event, {
      users: this.users,
      question: payload,
    });
    console.log(payload);
  }

  private isAdmin(userId: string) {
    return !this.isNotAdmin(userId);
  }

  private isNotAdmin(userId: string) {
    return userId !== this.admin.id;
  }
}

export class AnswerPayload {
  correctAnswer: string;
  userAnswer: string;
  remainingSeconds: number;
}

export class QuestionPayload {
  question: string;
  answerOptions: string[];
  correctAnswer: string;
  totalSeconds: number;
}
