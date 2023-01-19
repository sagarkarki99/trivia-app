import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { TriviaPool } from './game/trivia.pool';

@Controller('/')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly triviaPool: TriviaPool,
  ) {}
}
