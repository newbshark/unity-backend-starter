import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('shout')
  handleShout(@MessageBody() data: { text?: string }) {
    const text = String(data?.text || 'Сигнал от сервера!').slice(0, 80);
    if (this.server?.clients) {
      for (const client of this.server.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(text);
        }
      }
    }
  }
}
