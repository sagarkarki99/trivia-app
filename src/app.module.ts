import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TriviaPool } from './game/trivia.pool';
import { GameGateway } from './gateway/game.gateway';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, GameGateway, TriviaPool],
})
export class AppModule {}
