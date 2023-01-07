import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { TriviaPool } from 'src/game/trivia.pool';

@WebSocketGateway()
export class GameGateway {
  constructor(private readonly gamePool: TriviaPool) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinGame')
  handleJoinGame(@MessageBody() payload: Map<string, any>) {
    console.log(payload);
  }
}
