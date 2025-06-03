import {
  type MessageQueueItem,
  MessageStatus,
  type MessageQueueStats,
  type MessageStatusType,
} from "../types/messageQueue";

class MessageQueueDB {
  private static instance: MessageQueueDB;
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private constructor() {
    this.initDB();
  }

  public static getInstance(): MessageQueueDB {
    if (!MessageQueueDB.instance) {
      MessageQueueDB.instance = new MessageQueueDB();
    }
    return MessageQueueDB.instance;
  }

  private async initDB(): Promise<void> {
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("MessageQueueDB", 1);

      request.onerror = (event: Event) => {
        console.error(
          "Error opening database:",
          (event.target as IDBOpenDBRequest).error
        );
        reject((event.target as IDBOpenDBRequest).error);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Messages store
        const messagesStore = db.createObjectStore("messages", {
          keyPath: "id",
          autoIncrement: true,
        });
        messagesStore.createIndex("tempId", "tempId", { unique: true });
        messagesStore.createIndex("conversationId", "conversationId");
        messagesStore.createIndex("status", "status");
        messagesStore.createIndex("createdAt", "createdAt");
      };
    });
  }

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.initDB();
    }
    return this.dbPromise!;
  }

  private async getStore(
    storeName: string,
    mode: IDBTransactionMode
  ): Promise<{
    store: IDBObjectStore;
    transaction: IDBTransaction;
  }> {
    const db = await this.getDB();
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    return { store, transaction };
  }

  public async addMessage(
    message: Omit<MessageQueueItem, "id">
  ): Promise<number> {
    const { store } = await this.getStore("messages", "readwrite");
    const request = store.add(message);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  public async getMessageById(id: number): Promise<MessageQueueItem | null> {
    const { store } = await this.getStore("messages", "readonly");
    const request = store.get(id);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async updateMessageStatus(
    id: number,
    status: MessageStatusType,
    tempId?: string,
    error?: string
  ): Promise<MessageQueueItem> {
    const { store } = await this.getStore("messages", "readwrite");
    const request = store.get(Number(tempId));
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const message = request.result as MessageQueueItem;
        if (message) {
          message.status = status;
          message.updatedAt = new Date().toISOString();
          if (tempId) message.tempId = tempId;
          if (error) message.lastError = error;
          store.put(message);
          resolve(message);
        } else {
          reject(new Error("Message not found"));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async getNextPendingMessage(): Promise<MessageQueueItem | null> {
    const { store } = await this.getStore("messages", "readonly");
    const index = store.index("status");
    const request = index.get(MessageStatus.PENDING);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async getStats(): Promise<MessageQueueStats> {
    const { store } = await this.getStore("messages", "readonly");
    const index = store.index("status");
    const stats: MessageQueueStats = {
      PENDING: 0,
      SENT: 0,
      SEEN: 0,
      DELIVERED: 0,
      FAILED: 0,
    };

    const promises = Object.values(MessageStatus).map((status) => {
      return new Promise((resolve, reject) => {
        const request = index.count(status);
        request.onsuccess = () => {
          stats[status] = request.result;
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    });

    return Promise.all(promises).then(() => stats);
  }

  public async cleanupOldMessages(days: number = 7): Promise<void> {
    const cutoff = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();
    const { store } = await this.getStore("messages", "readwrite");
    const index = store.index("createdAt");
    const request = index.openCursor(null, "prev");
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursor>).result;
        if (cursor) {
          const message = cursor.source.get(cursor.primaryKey)
            .result as MessageQueueItem;
          if (message.createdAt < cutoff) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async getMessagesByStatus(
    status: MessageStatus
  ): Promise<MessageQueueItem[]> {
    const { store } = await this.getStore("messages", "readonly");

    return new Promise<MessageQueueItem[]>((resolve, reject) => {
      const statusIndex = store.index("status");
      const request = statusIndex.getAll(status);
      request.onsuccess = () => {
        const messages = request.result;
        resolve(messages);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const messageQueueDB = MessageQueueDB.getInstance();
