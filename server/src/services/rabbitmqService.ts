import amqp from "amqplib";
import type { Channel, ChannelModel } from "amqplib";
import { logger } from "../utils/logger";
import { QUEUE_CONFIG } from "../types/messages";
import { rabbitmqConfig } from "../config/rabbitmq";

export class RabbitMQService {
  private static instance: RabbitMQService;
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  private constructor() {}

  public static getInstance(): RabbitMQService {
    if (!RabbitMQService.instance) {
      RabbitMQService.instance = new RabbitMQService();
    }
    return RabbitMQService.instance;
  }

  public async connect(): Promise<void> {
    try {
      if (this.connection) {
        return;
      }

      this.connection = await amqp.connect(rabbitmqConfig.url);
      this.channel = await this.connection.createChannel();

      // Set up queues
      await Promise.all(
        Object.values(QUEUE_CONFIG).map(async (queueConfig) => {
          await this.channel?.assertQueue(queueConfig.name, {
            durable: queueConfig.durable,
            autoDelete: queueConfig.autoDelete,
          });
        })
      );

      // Set up error handling
      this.connection.on("error", (error) => {
        logger.error("RabbitMQ connection error:", error);
        this.reconnect();
      });

      this.connection.on("close", () => {
        logger.warn("RabbitMQ connection closed, attempting to reconnect...");
        this.reconnect();
      });

      logger.info("Connected to RabbitMQ");
    } catch (error) {
      logger.error("Failed to connect to RabbitMQ:", error);
      this.reconnect();
    }
  }

  private async reconnect(): Promise<void> {
    this.connection = null;
    this.channel = null;
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait before retrying
    await this.connect();
  }

  public async publish(queue: string, message: any): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    try {
      await this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
      logger.info(`Published message to ${queue}:`, message);
    } catch (error) {
      logger.error(`Failed to publish message to ${queue}:`, error);
      throw error;
    }
  }

  public async consume(
    queue: string,
    handler: (msg: any) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    try {
      await this.channel.consume(
        queue,
        async (msg) => {
          if (msg) {
            try {
              const message = JSON.parse(msg.content.toString());
              await handler(message);
              this.channel?.ack(msg);
            } catch (error) {
              logger.error(`Error processing message from ${queue}:`, error);
              this.channel?.nack(msg, false, true); // Requeue the message
            }
          }
        },
        { noAck: false }
      );

      logger.info(`Started consuming messages from ${queue}`);
    } catch (error) {
      logger.error(`Failed to consume messages from ${queue}:`, error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.channel = null;
    this.connection = null;
    logger.info("RabbitMQ connection closed");
  }
  public async ack(msg: any): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }
    this.channel.ack(msg);
  }
}
