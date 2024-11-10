"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryEventListeners = void 0;
const kafka_node_1 = require("kafka-node");
const AppConfigurations_1 = __importDefault(require("../AppConfigurations"));
class InventoryEventListeners {
    constructor(logInventoryTrail) {
        this.logInventoryTrail = logInventoryTrail;
        this.config = new AppConfigurations_1.default().appConfiguration();
        this.kafkaClient = new kafka_node_1.KafkaClient({
            kafkaHost: this.config.kafka_connection,
        });
        this.kafkaClient.on("ready", () => {
            console.log("Kafka client connected successfully.");
        });
        this.kafkaClient.on("error", (err) => {
            console.error("Error connecting to Kafka:", err);
        });
        this.consumer = new kafka_node_1.Consumer(this.kafkaClient, [{ topic: `${this.config.kafka_topic}`, partition: 0 }], { autoCommit: true });
        this.producer = new kafka_node_1.Producer(this.kafkaClient);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.consumer.on("message", this.handleMessage.bind(this));
        });
    }
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notification = JSON.parse(message.value.toString());
                const validationError = this.validateNotification(notification);
                if (validationError) {
                    yield this.sendResponse({
                        userid: notification.userid,
                        productid: notification.productid,
                        status: "Invalid Request",
                        message: validationError,
                    });
                    return;
                }
                const removeSKU = yield this.logInventoryTrail.logInventoryTrail(notification.productid, notification.userid, notification.qty);
                if (!removeSKU.status) {
                    yield this.sendResponse({
                        userid: notification.userid,
                        productid: notification.productid,
                        status: "Invalid Request",
                        message: removeSKU.message,
                    });
                    return;
                }
                yield this.sendResponse(this.createInventoryResponse(notification.productid, notification.qty, notification.userid));
            }
            catch (error) {
                console.error("Error handling message:", error);
            }
        });
    }
    createInventoryResponse(productId, qty, userId) {
        return {
            userid: userId,
            productid: productId,
            qty: qty,
            status: "Available",
            message: "Stock available. Request processed successfully.",
        };
    }
    sendResponse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const payloads = [
                {
                    topic: `${this.config.kafka_response}`,
                    messages: JSON.stringify(response),
                },
            ];
            this.producer.send(payloads, (err) => {
                if (err) {
                    console.error("Error sending response:", err);
                }
                else {
                    console.log("Response sent successfully.");
                }
            });
        });
    }
    validateNotification(notification) {
        if (!notification.userid)
            return "User ID is missing or invalid.";
        if (!notification.productid)
            return "Product ID is missing or invalid.";
        if (notification.qty === undefined || notification.qty <= 0)
            return "Quantity must be greater than zero.";
        return null;
    }
}
exports.InventoryEventListeners = InventoryEventListeners;
