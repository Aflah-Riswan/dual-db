import amqp, { type Channel } from 'amqplib';
import type { IMessagingService } from '../../../application/use-cases/CreateUserCase.js';
import type { SyncUserUseCase } from '../../../application/use-cases/SyncUserUseCase.js';


export class RabbitMQService implements IMessagingService {
  private channel!: Channel;

  async initialize(url: string): Promise<void> {
    const connection = await amqp.connect(url);
    this.channel = await connection.createChannel();
  }

  async publish(queue: string, action: string, message: any): Promise<void> {
    await this.channel.assertQueue(queue, { durable: true });
    const enforcementPayload = { action, payload: message };
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(enforcementPayload)), { persistent: true });
  }

  async consume(queue: string, syncUseCase: SyncUserUseCase): Promise<void> {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const { action, payload } = JSON.parse(msg.content.toString());
          await syncUseCase.execute(action, payload);
          this.channel.ack(msg);
        } catch (error) {
          this.channel.nack(msg, false, true);
        }
      }
    });
  }
}