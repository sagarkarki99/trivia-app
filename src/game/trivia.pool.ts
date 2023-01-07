import { Injectable } from '@nestjs/common';

@Injectable()
export class TriviaPool {
  private adminToGames = new Map<string, TriviaGame>();

  createNewGame(user: Admin): string {
    if (this.adminToGames[user.id]) {
      throw new Error('User already has a game going on.');
    }
    const game = new TriviaGame(user);
    this.adminToGames[user.id] = game;
    return game.id;
  }

  finishGame(user: Admin) {
    this.adminToGames[user.id] = null;
  }
}

export class TriviaGame {
  readonly id: string;
  users: ActiveUser[] = [];
  constructor(private readonly admin: Admin) {
    this.id = 'sdf';
  }

  answer(userId: string, payload: AnswerPayload) {
    if (this.isAdmin(userId)) {
      throw new Error('Admin cannot answer the question.');
    }

    this.notifyAdmin(userId, payload);
    console.log(payload.correctAnswer, userId);
  }

  askQuestion(userId: string, payload: QuestionPayload) {
    if (this.isNotAdmin(userId)) {
      throw new Error('Only admin can post questions.');
    }
    //TODO: report back to all the users of this game
    this.notifyUsers(payload);
    console.log(payload.question);
  }

  joinGame(user: ActiveUser) {
    this.users.push(user);
  }

  leaveGame(userId: string) {
    //TODO:leaving game
    console.log(userId);
  }

  private notifyAdmin(userId: string, payload: AnswerPayload) {
    //TODO: report back to the admin of this game
    console.log(userId, payload);
  }

  private notifyUsers(payload: QuestionPayload) {
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

export type Admin = User;

export class User {
  id: string;
}

export class ActiveUser {
  id: string;
  connectionId: string;
}
