import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { stringify } from 'querystring';
import { Socket, Server } from 'socket.io';
import { ActiveUser, User } from 'src/entities/user';
import {
  BroadcastEvent,
  GameEvent,
  NewAnswerEvent,
  QuestionAskedEvent,
} from 'src/game/game.events';
import { TriviaPool } from 'src/game/trivia.pool';
import { JoinGameInput, AskQuestionInput, AnswerQuestionInput } from './inputs';
import { instanceToPlain } from 'class-transformer';
import { Logger } from '@nestjs/common';

@WebSocketGateway(3001)
export class GameGateway {
  constructor(private readonly gamePool: TriviaPool) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createGame')
  handleCreateGame(
    @MessageBody() user: User,
    @ConnectedSocket() client: Socket,
  ) {
    const connectionId = client.id;
    const gameId = this.gamePool.createNewGame({
      connectionId: connectionId,
      ...user,
    });
    client.emit('gameCreated', gameId);
    return gameId;
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(
    @MessageBody() input: JoinGameInput,
    @ConnectedSocket() client: Socket,
  ) {
    const connectionId = client.id;
    const activeUser: ActiveUser = {
      connectionId: connectionId,
      id: input.user.id,
      imageUrl: input.user.imageUrl,
      name: input.user.name,
    };
    const gameState = this.gamePool.joinGame(input.gameId, activeUser);
    const response = instanceToPlain(gameState);
    Logger.log(response, 'JoinGame');
    client.emit('joined', response);
  }

  @SubscribeMessage('askQuestion')
  handleAskQuestion(
    @MessageBody() input: AskQuestionInput,
    @ConnectedSocket() client: Socket,
  ) {
    const game = this.gamePool.getGame(input.gameId);
    if (game) {
      game.askQuestion(input.gameId, input.questionPayload);
    } else {
      client.disconnect();
    }
  }

  @SubscribeMessage('answerQuestion')
  handleAnswerQuestion(
    @MessageBody() payload: AnswerQuestionInput,
    @ConnectedSocket() client: Socket,
  ) {
    const game = this.gamePool.getGame(payload.gameId);
    if (game) {
      game.answer('ClientId', payload.answer);
    } else {
      client.disconnect(true);
    }
  }

  @OnEvent(GameEvent.questionAsked)
  handleQuestionAsked(payload: QuestionAskedEvent) {
    console.log(payload);
    payload.users.forEach((user) => {
      this.server.to(user.connectionId).emit('questionAsked', payload.question);
    });
  }

  @OnEvent(GameEvent.newAnswer)
  handleNewAnswer(payload: NewAnswerEvent) {
    this.server.to(payload.admin.connectionId).emit('newAnswerSubmitted', {
      answeringUserId: payload.userId,
      ...payload.answer,
    });
  }

  @OnEvent(GameEvent.newUserJoined)
  broadcastNewUserJoined(payload: BroadcastEvent) {
    payload.users.forEach((user) =>
      this.server
        .to(user.connectionId)
        .emit('newUserJoined', instanceToPlain(payload.payload)),
    );
  }

  @OnEvent(GameEvent.leaveGame)
  broadcastUserLeft(payload: BroadcastEvent) {
    payload.users.forEach((user) =>
      this.server.to(user.connectionId).emit('userLeft', payload.payload),
    );
  }
}
