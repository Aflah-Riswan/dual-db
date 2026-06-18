import amqp, { type Channel } from "amqplib";
import type { IMessegingService } from "../../../application/use-cases/CreateUserCase.js";
import type { SyncUserUseCase } from "../../../application/use-cases/SyncUserUseCase.js";

export class RabbitMQService implements IMessegingService {
  private channel!: Channel;
  async initialize(url: string): Promise<void> {
    const connection = await amqp.connect(url);
    this.channel = await connection.createChannel();
  }
  async publish(queue: string, message: any): Promise<void> {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  }
  async consume(queue: string, syncUseCase: SyncUserUseCase): Promise<void> {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const payload = JSON.parse(msg.content.toString());
          await syncUseCase.execute(payload);
          this.channel.ack(msg);
        } catch (error) {
          console.error("Worker processing failure, requeuing...", error);
          this.channel.nack(msg, false, true);
        }
      }
    });
  }
}
