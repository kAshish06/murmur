import { Channel, ChannelModel, ConsumeMessage } from "amqplib";
import { RabbitMQService } from "../rabbitmqService";
import { QUEUE_CONFIG } from "../../types/messages";
import { rabbitmqConfig } from "../../config/rabbitmq";
import amqp from "amqplib";
import { logger } from "../../utils/logger";

// Mock the amqp module
jest.mock("amqplib", () => {
  return {
    connect: jest.fn(),
    Channel: jest.fn(),
    ChannelModel: jest.fn(),
  } as unknown as typeof amqp;
});

describe("RabbitMQService", () => {
  let service: RabbitMQService;
  let mockChannel: Pick<
    Channel,
    "assertQueue" | "sendToQueue" | "consume" | "ack" | "nack" | "close"
  >;
  let mockConnection: Pick<
    ChannelModel,
    "createChannel" | "on" | "close" | "emit"
  >;

  beforeEach(() => {
    service = RabbitMQService.getInstance();
    mockChannel = {
      assertQueue: jest.fn().mockResolvedValue({}),
      sendToQueue: jest.fn().mockResolvedValue(undefined),
      consume: jest.fn().mockResolvedValue(undefined),
      ack: jest.fn(),
      nack: jest.fn(),
      close: jest.fn(),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      on: jest.fn(),
      close: jest.fn(),
      emit: jest.fn(),
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("connect", () => {
    it("should connect to RabbitMQ and set up queues", async () => {
      await service.connect();

      expect(amqp.connect).toHaveBeenCalledWith(rabbitmqConfig.url);
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertQueue).toHaveBeenCalledTimes(
        Object.keys(QUEUE_CONFIG).length
      );
    });

    it("should handle connection errors", async () => {
      (amqp.connect as jest.Mock).mockRejectedValue(
        new Error("Connection failed")
      );

      const errorSpy = jest.spyOn(logger, "error");

      await service.connect();

      expect(errorSpy).toHaveBeenCalledWith(
        "Failed to connect to RabbitMQ:",
        expect.any(Error)
      );
    });

    fit("should handle error events", async () => {
      await service.connect();
      const errorEvent = new Error("Connection error");
      mockConnection.emit("error", errorEvent);

      expect(logger.error).toHaveBeenCalledWith(
        "RabbitMQ connection error:",
        errorEvent
      );
    });
  });

  describe("publish", () => {
    it("should publish a message to a queue", async () => {
      const queue = QUEUE_CONFIG.incoming.name;
      const message = { test: "message" };

      await service.connect();
      await service.publish(queue, message);

      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        queue,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
    });

    it("should throw error if channel is not initialized", async () => {
      await expect(
        service.publish(QUEUE_CONFIG.incoming.name, {})
      ).rejects.toThrow("RabbitMQ channel not initialized");
    });

    it("should handle publish errors", async () => {
      await service.connect();

      // Mock sendToQueue to return false
      mockChannel.sendToQueue = jest.fn().mockReturnValue(false);

      await expect(
        service.publish(QUEUE_CONFIG.incoming.name, {})
      ).rejects.toThrow("Failed to publish message");
    });
  });

  describe("consume", () => {
    it("should consume messages from a queue", async () => {
      const queue = QUEUE_CONFIG.incoming.name;
      const handler = jest.fn();

      await service.connect();
      await service.consume(queue, handler);

      expect(mockChannel.consume).toHaveBeenCalledWith(
        queue,
        expect.any(Function),
        { noAck: false }
      );
    });

    it("should handle message processing errors", async () => {
      const queue = QUEUE_CONFIG.incoming.name;
      const handler = jest.fn(() => {
        throw new Error("Processing error");
      });

      await service.connect();
      await service.consume(queue, handler);

      // Simulate message arrival
      const mockMessage: ConsumeMessage = {
        content: Buffer.from(JSON.stringify({})),
        fields: {} as any,
        properties: {} as any,
      };
      const consumeSpy = jest.spyOn(mockChannel, "consume");
      const consumeCallback = consumeSpy.mock.calls[0][1] as (
        msg: ConsumeMessage | null
      ) => Promise<void>;
      await consumeCallback(mockMessage);

      expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, true);
    });

    it("should handle consume errors", async () => {
      await service.connect();

      // Mock consume to throw an error
      mockChannel.consume = jest
        .fn()
        .mockImplementation((queue, callback, options) => {
          throw new Error("Consume failed");
        });

      await expect(
        service.consume(
          QUEUE_CONFIG.incoming.name,
          (): Promise<void> => Promise.resolve()
        )
      ).rejects.toThrow("Failed to consume messages");
    });
  });

  describe("close", () => {
    it("should close the connection and channel", async () => {
      await service.connect();
      await service.close();

      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });
  });

  describe("ack", () => {
    it("should acknowledge a message", async () => {
      await service.connect();
      const mockMessage: ConsumeMessage = {
        content: Buffer.from(JSON.stringify({})),
        fields: {} as any,
        properties: {} as any,
      };
      await service.ack(mockMessage);

      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
    });

    it("should throw error if channel is not initialized", async () => {
      const mockMessage: ConsumeMessage = {
        content: Buffer.from(JSON.stringify({})),
        fields: {} as any,
        properties: {} as any,
      };
      await expect(service.ack(mockMessage)).rejects.toThrow(
        "RabbitMQ channel not initialized"
      );
    });
  });
});
