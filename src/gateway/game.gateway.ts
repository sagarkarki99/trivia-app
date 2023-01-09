import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { QuestionPayload, AnswerPayload } from 'src/game/game';
import {
  GameEvent,
  NewAnswerEvent,
  QuestionAskedEvent,
} from 'src/game/game.events';
import { TriviaPool } from 'src/game/trivia.pool';

export class JoinGameInput {
  gameId: string;
}

export class AskQuestionInput {
  gameId: string;
  questionPayload: QuestionPayload;
}
export class AnswerQuestionInput {
  gameId: string;
  answer: AnswerPayload;
}

@WebSocketGateway(3001)
export class GameGateway {
  constructor(private readonly gamePool: TriviaPool) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createGame')
  handleCreateGame(@MessageBody() userId, @ConnectedSocket() client: Socket) {
    const connectionId = client.id;
    const gameId = this.gamePool.createNewGame({
      connectionId: connectionId,
      id: userId,
    });
    client.emit('gameCreated', gameId);
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(
    @MessageBody() input: JoinGameInput,
    @ConnectedSocket() client: Socket,
  ) {
    const connectionId = client.id;
    this.gamePool.joinGame(input.gameId, {
      connectionId: connectionId,
      id: input.gameId,
    });
    client.emit('joined');
  }

  @SubscribeMessage('askQuestion')
  handleAskQuestion(@MessageBody() input: AskQuestionInput) {
    const game = this.gamePool.getGame(input.gameId);
    if (game) {
      game.askQuestion(input.gameId, input.questionPayload);
    } else {
      //TODO: terminate this connection
    }
  }

  @SubscribeMessage('answerQuestion')
  handleAnswerQuestion(@MessageBody() payload: AnswerQuestionInput) {
    const game = this.gamePool.getGame(payload.gameId);
    if (game) {
      game.answer('ClientId', payload.answer);
    } else {
      //TODO: terminate this connection with client.
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
}
