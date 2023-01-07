import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { TriviaPool } from './game/trivia.pool';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly triviaPool: TriviaPool,
  ) {}

  @Post('/create')
  async createGame() {
    const gameId = await this.triviaPool.createNewGame({ id: 'sdf' });
    return {
      gameId: gameId,
    };
  }
}
