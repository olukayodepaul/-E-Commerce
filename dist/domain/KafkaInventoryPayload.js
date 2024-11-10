"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaMessage = exports.KafkaInventoryPayload = void 0;
class KafkaInventoryPayload {
    constructor(status, topic, payload) {
        this.status = status;
        this.topic = topic;
        this.payload = payload;
    }
}
exports.KafkaInventoryPayload = KafkaInventoryPayload;
class KafkaMessage {
    constructor(product_id, name, description, stock_level, _id) {
        this.product_id = product_id;
        this.name = name;
        this.description = description;
        this.stock_level = stock_level;
        this._id = _id;
    }
}
exports.KafkaMessage = KafkaMessage;
