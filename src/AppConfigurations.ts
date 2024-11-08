import dotenv from "dotenv";
dotenv.config();

export default class AppConfigurations {
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
