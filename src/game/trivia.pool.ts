import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActiveUser, Admin } from 'src/entities/user';
import { TriviaGame } from './game';

@Injectable()
export class TriviaPool {
  constructor(private readonly eventEmitter: EventEmitter2) {}
  private adminToGames = new Map<string, TriviaGame>();

  createNewGame(user: Admin): string {
    if (this.adminToGames[user.id]) {
      throw new Error('User already has a game going on.');
    }
    const game = new TriviaGame(user, this.eventEmitter);
    this.adminToGames[user.id] = game;
    return game.id;
  }

  joinGame(gameId: string, user: ActiveUser): any {
    const game: TriviaGame = this.adminToGames[gameId];
    //here gameId is userId of admin
    if (game) {
      return game.joinGame(user);
    } else {
      throw new GameException('Game does not exist.');
    }
  }

  getGame(gameId: string): TriviaGame | null {
    return this.adminToGames[gameId];
  }

  finishGame(user: Admin) {
    this.adminToGames[user.id] = null;
  }
}

export class GameException extends Error {
  title?: string;
  message: string;
}
