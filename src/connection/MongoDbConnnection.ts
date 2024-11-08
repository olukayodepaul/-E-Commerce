import mongoose from "mongoose";
import AppConfigurations from "../AppConfigurations";

class MongoDbConnection {
  static async applyConnection() {
    const connectionString = new AppConfigurations().appConfiguration()
      .mongodb!;
    try {
      const connection = await mongoose.connect(connectionString);
      console.log("Connected to MongoDB");
      return connection;
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      process.exit(1);
    }
  }
}

export default MongoDbConnection;
