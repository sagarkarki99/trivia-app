import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActiveUser, Admin, User } from 'src/entities/user';
import { GameEvent } from './game.events';

export class TriviaGame {
  readonly id: string;
  users: ActiveUser[] = [];
  rounds: Round[] = [];
  currentRound: Round;

  constructor(
    private readonly admin: Admin,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.id = admin.id;
  }

  answer(connectionId: string, payload: AnswerPayload) {
    const user = this.users.find((user) => user.connectionId == connectionId);
    if (this.isAdmin(user.id)) {
      throw new Error('Admin cannot answer the question.');
    }

    const answer = {
      userId: user.id,
      timeTaken:
        this.currentRound.question.totalSeconds - payload.remainingSeconds,
      userAnswer: payload.userAnswer,
    };
    this.currentRound.answers.push(answer);

    this.notifyAdmin(GameEvent.newAnswer, answer);
  }

  askQuestion(connectionId: string, payload: QuestionPayload) {
    if (this.isNotAdmin(connectionId)) {
      throw new Error('Only admin can post questions.');
    }

    if (this.currentRound) {
      this.rounds.push(this.currentRound);
    }
    this.currentRound = new Round(payload, []);

    this.broadcastMessage(GameEvent.questionAsked, payload);
    console.log(payload.question);
  }

  joinGame(user: ActiveUser): GameState {
    this.users.push(user);
    this.broadcastMessage(GameEvent.newUserJoined, {
      id: user.id,
      name: user.name,
      imageUrl: user.imageUrl,
    });
    return {
      gameId: this.id,
      connectedUsers: this.users,
      admin: this.admin,
    };
  }

  leaveGame(userId: string) {
    this.users = this.users.filter((user) => user.id === userId);
    this.broadcastMessage(GameEvent.leaveGame, { userId: userId });
    console.log(userId);
  }

  finish() {
    this.broadcastMessage(GameEvent.finish, {
      message: 'Game is finished.',
    });
  }

  private broadcastMessage(event: GameEvent, payload: any) {
    this.eventEmitter.emit(event, {
      users: [this.admin, ...this.users],
      payload: payload,
    });
  }

  private notifyAdmin(event: GameEvent, payload: any) {
    this.eventEmitter.emit(event, {
      admin: this.admin,
      answer: payload,
    });
  }

  private notifyUsers(event: GameEvent, payload: QuestionPayload) {
    this.eventEmitter.emit(event, {
      users: this.users,
      payload: payload,
    });
    console.log(payload);
  }

  private isAdmin(userId: string) {
    return !this.isNotAdmin(userId);
  }

  private isNotAdmin(connectionId: string) {
    return connectionId !== this.admin.connectionId;
  }
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

export type GameState = {
  gameId: string;
  connectedUsers: User[];
  admin: User;
};

export class Round {
  constructor(public question: QuestionPayload, public answers: Answer[]) {}
}

export type Answer = {
  userId: string;
  timeTaken: number;
  userAnswer: string;
};
