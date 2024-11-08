import { KafkaClient, Producer, Consumer } from "kafka-node";
import AppConfigurations from "../AppConfigurations";
import { LogInventoryTrail } from "../services/LogInventoryTrail";

interface Notification {
  userid: string;
  productid: string;
  qty: number;
}

interface InventoryResponse {
  userid: string;
  productid: string;
  qty?: number;
  status: "Available" | "Insufficient" | "Invalid Request";
  message: string;
}

export class InventoryEventListeners {
  private kafkaClient: KafkaClient;
  private consumer: Consumer;
  private producer: Producer;
  private config = new AppConfigurations().appConfiguration();

  constructor(private logInventoryTrail: LogInventoryTrail) {
    this.kafkaClient = new KafkaClient({
      kafkaHost: this.config.kafka_connection,
    });

    this.kafkaClient.on("ready", () => {
      console.log("Kafka client connected successfully.");
    });

    this.kafkaClient.on("error", (err) => {
      console.error("Error connecting to Kafka:", err);
    });

    this.consumer = new Consumer(
      this.kafkaClient,
      [{ topic: `${this.config.kafka_topic}`, partition: 0 }],
      { autoCommit: true }
    );
    this.producer = new Producer(this.kafkaClient);
  }

  async start() {
    this.consumer.on("message", this.handleMessage.bind(this));
  }

  private async handleMessage(message: any) {
    try {
      const notification: Notification = JSON.parse(message.value.toString());
      const validationError = this.validateNotification(notification);

      if (validationError) {
        await this.sendResponse({
          userid: notification.userid,
          productid: notification.productid,
          status: "Invalid Request",
          message: validationError,
        });
        return;
      }

      const removeSKU = await this.logInventoryTrail.logInventoryTrail(
        notification.productid,
        notification.userid,
        notification.qty
      );

      if (!removeSKU.status) {
        await this.sendResponse({
          userid: notification.userid,
          productid: notification.productid,
          status: "Invalid Request",
          message: removeSKU.message,
        });
        return;
      }

      await this.sendResponse(
        this.createInventoryResponse(
          notification.productid,
          notification.qty,
          notification.userid
        )
      );
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  private createInventoryResponse(
    productId: string,
    qty: number,
    userId: string
  ): InventoryResponse {
    return {
      userid: userId,
      productid: productId,
      qty: qty,
      status: "Available",
      message: "Stock available. Request processed successfully.",
    };
  }

  private async sendResponse(response: InventoryResponse): Promise<void> {
    const payloads = [
      {
        topic: `${this.config.kafka_response}`,
        messages: JSON.stringify(response),
      },
    ];

    this.producer.send(payloads, (err) => {
      if (err) {
        console.error("Error sending response:", err);
      } else {
        console.log("Response sent successfully.");
      }
    });
  }

  private validateNotification(notification: Notification): string | null {
    if (!notification.userid) return "User ID is missing or invalid.";
    if (!notification.productid) return "Product ID is missing or invalid.";
    if (notification.qty === undefined || notification.qty <= 0)
      return "Quantity must be greater than zero.";
    return null;
  }
}
