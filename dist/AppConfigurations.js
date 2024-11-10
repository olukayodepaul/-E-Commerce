"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class AppConfigurations {
    appConfiguration() {
        const config = {
            kafka_topic: process.env.KAFKA_TOPIC,
            kafka_response: process.env.KAFKA_TOPIC_RESPONSE,
            kafka_connection: process.env.KAFKA_CONNECTION,
            port: process.env.PORT || "5001",
            mongodb: process.env.MONGO_DB_CONNECTION,
            pgadmin: process.env.PG_ADMIN || {},
        };
        return config;
    }
}
exports.default = AppConfigurations;
