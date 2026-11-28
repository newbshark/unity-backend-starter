import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('shout')
  handleShout(@MessageBody() data: { text?: string }) {
    this.broadcast(data?.text || 'Сигнал от сервера!');
  }

  broadcast(rawText?: string) {
    const text = String(rawText || 'Сигнал от сервера!').slice(0, 120);
    let sent = 0;
    if (this.server?.clients) {
      for (const client of this.server.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(text);
          sent++;
        }
      }
    }
    return { text, clientsNotified: sent };
  }
}
