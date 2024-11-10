import { MongoClient, Db, Collection } from "mongodb";
import { Inventory } from "../domain/Inventory";
import { InventoryTrail } from "../domain/InventoryTrail";
import MongoDbConnection from "../connection/MongoDbConnnection";
import CustomError from "../error/CustomError";

export default class InventoryRepository {
  private client: MongoClient;
  private db!: Db;
  private collection!: Collection<Inventory>;
  private inventoryTrail!: Collection<InventoryTrail>;

  constructor() {
    MongoDbConnection.applyConnection();
    this.client = new MongoClient(process.env.MONGO_DB_CONNECTION as string);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db();
      this.collection = this.db.collection<Inventory>("inventory");
      this.inventoryTrail =
        this.db.collection<InventoryTrail>("inventory_trail");
    } catch (error) {
      throw new CustomError("Failed to connect to MongoDB", 500);
    }
  }

  async save(inventory: Inventory): Promise<Inventory> {
    await this.connect();

    try {
      const existingInventory = await this.collection.findOne({
        product_id: inventory.product_id,
      });

      if (existingInventory) {
        const updatedInventory = await this.collection.findOneAndUpdate(
          { product_id: inventory.product_id },
          {
            $inc: { stock_level: inventory.stock_level },
            $set: { name: inventory.name, description: inventory.description },
          },
          { returnDocument: "after" }
        );

        if (updatedInventory) {
          const mappedInventory = new Inventory(
            updatedInventory.product_id,
            updatedInventory.name,
            updatedInventory.description,
            updatedInventory.stock_level,
            updatedInventory._id?.toString()
          );
          return mappedInventory;
        } else {
          throw new CustomError("Inventory update failed", 500);
        }
      } else {
        await this.collection.insertOne(inventory);
        return inventory;
      }
    } catch (error) {
      throw new CustomError("Failed to save inventory", 500);
    }
  }

  async findInventoryByProductId(
    product_id: string
  ): Promise<Inventory | null> {
    await this.connect();

    try {
      const result = await this.collection.findOne({ product_id });
      return result ?? null;
    } catch (error) {
      throw new CustomError("Failed to find inventory", 404);
    }
  }

  async removeItemFromInventory(
    productId: string,
    qty: number
  ): Promise<{ message: string; status: boolean }> {
    try {
      const stockReduction = await this.collection.findOneAndUpdate(
        { product_id: productId },
        { $inc: { stock_level: -qty } },
        { returnDocument: "after" }
      );
      return { message: `${stockReduction?._id}`, status: true };
    } catch (err) {
      return { message: `${err}`, status: false };
    }
  }

  async logInventoryItem(trail: InventoryTrail): Promise<InventoryTrail> {
    try {
      await this.connect();
      await this.inventoryTrail.insertOne(trail);
      return trail;
    } catch (error) {
      throw new CustomError("Failed to save trail", 500);
    }
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}
