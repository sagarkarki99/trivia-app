import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ActiveUser, User } from 'src/entities/user';
import {
  BroadcastResponseEvent,
  GameEvent,
  NewAnswerResponseEvent,
  QuestionAskedResponseEvent,
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
    Logger.log(`Game created with ${gameId}`);
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

  @SubscribeMessage('startGame')
  handleStartGame(
    @MessageBody() gameId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const game = this.gamePool.getGame(gameId);
    game.users.forEach((user) =>
      this.server.to(user.connectionId).emit('gameStarted', {}),
    );
    client.emit('gameStarted');
  }

  @SubscribeMessage('finishGame')
  handleFinishGame(@MessageBody() gameId: string) {
    this.gamePool.finishGame(gameId);
  }

  @SubscribeMessage('askQuestion')
  handleAskQuestion(
    @MessageBody() input: AskQuestionInput,
    @ConnectedSocket() client: Socket,
  ) {
    const game = this.gamePool.getGame(input.gameId);
    if (game) {
      game.askQuestion(client.id, input.questionPayload);
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
      game.answer(client.id, payload.answer);
    } else {
      client.disconnect(true);
    }
  }

  @OnEvent(GameEvent.questionAsked)
  handleQuestionAsked(payload: QuestionAskedResponseEvent) {
    console.log(payload);
    const questionResponse = instanceToPlain(payload.payload);
    Logger.log(questionResponse, 'NewQuestion');
    payload.users.forEach((user) => {
      this.server.to(user.connectionId).emit('questionAsked', questionResponse);
    });
  }

  @OnEvent(GameEvent.newAnswer)
  handleNewAnswer(payload: NewAnswerResponseEvent) {
    const answerResponse = instanceToPlain({
      ...payload.answer,
    });
    Logger.log(answerResponse, 'NewAnswer');
    this.server
      .to(payload.admin.connectionId)
      .emit('newAnswerSubmitted', answerResponse);
  }

  @OnEvent(GameEvent.newUserJoined)
  broadcastNewUserJoined(payload: BroadcastResponseEvent) {
    payload.users.forEach((user) =>
      this.server
        .to(user.connectionId)
        .emit('newUserJoined', instanceToPlain(payload.payload)),
    );
  }

  @OnEvent(GameEvent.finish)
  broadCastFinishGame(payload: BroadcastResponseEvent) {
    payload.users.forEach((user) =>
      this.server
        .to(user.connectionId)
        .emit('gameFinished', instanceToPlain(payload.payload)),
    );
  }

  @OnEvent(GameEvent.leaveGame)
  broadcastUserLeft(payload: BroadcastResponseEvent) {
    payload.users.forEach((user) =>
      this.server.to(user.connectionId).emit('userLeft', payload.payload),
    );
  }
}
