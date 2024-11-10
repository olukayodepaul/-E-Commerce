import { LogInventoryTrail } from "../services/LogInventoryTrail";
import InventoryRepository from "../repositories/InventoryRepository";
import { InventoryTrail } from "../domain/InventoryTrail";
import { Inventory } from "../domain/Inventory"; // Ensure Inventory model is imported

jest.mock("../repositories/InventoryRepository");

describe("LogInventoryTrail Service", () => {
  let logInventoryTrail: LogInventoryTrail;
  let inventoryRepository: jest.Mocked<InventoryRepository>;

  beforeEach(() => {
    inventoryRepository =
      new InventoryRepository() as jest.Mocked<InventoryRepository>;
    logInventoryTrail = new LogInventoryTrail(inventoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should save inventory trail successfully", async () => {
    const productId = "07a6965a-5aa9-4994-82d1-418f5a76e380";
    const userId = "user-123";
    const quantity = 5;

    const existingInventory: Inventory | null = {
      product_id: productId,
      stock_level: 10,
      name: "Product A", // Add missing fields based on Inventory model
      description: "Sample product",
    };

    const expectedTrail = new InventoryTrail(productId, userId, quantity);

    inventoryRepository.findInventoryByProductId.mockResolvedValue(
      existingInventory
    );
    inventoryRepository.removeItemFromInventory.mockResolvedValue({
      status: true,
      message: "Inventory updated successfully", // Include message
    });
    inventoryRepository.logInventoryItem.mockResolvedValue(expectedTrail); // Returns the trail on success

    const result = await logInventoryTrail.logInventoryTrail(
      productId,
      userId,
      quantity
    );

    expect(result).toEqual({
      status: true,
      message: "Inventory trail logged successfully",
    });
    expect(inventoryRepository.logInventoryItem).toHaveBeenCalledWith(
      expectedTrail
    );
  });

  it("should return error if save fails", async () => {
    const productId = "123";
    const userId = "456";
    const qty = 10;
    const inventoryTrail = new InventoryTrail(productId, userId, qty);

    inventoryRepository.logInventoryItem.mockRejectedValueOnce(
      new Error("Failed to log inventory trail")
    );

    const result = await logInventoryTrail.logInventoryTrail(
      productId,
      userId,
      qty
    );

    expect(inventoryRepository.logInventoryItem).toHaveBeenCalledWith(
      inventoryTrail
    );
    expect(result.status).toBe(false);
    expect(result.message).toBe("Failed to log inventory trail.");
  });

  it("should return error if product not found in inventory", async () => {
    const productId = "nonexistent-id";
    const userId = "user-123";
    const qty = 5;

    inventoryRepository.findInventoryByProductId.mockResolvedValue(null); // Simulate not found inventory

    const result = await logInventoryTrail.logInventoryTrail(
      productId,
      userId,
      qty
    );

    expect(result.status).toBe(false);
    expect(result.message).toBe("Product not found in inventory.");
  });

  it("should return error if quantity exceeds available stock", async () => {
    const productId = "07a6965a-5aa9-4994-82d1-418f5a76e380";
    const userId = "user-123";
    const qty = 20;
    const existingInventory: Inventory = {
      product_id: productId,
      stock_level: 10,
      name: "Product A", // Add missing fields
      description: "Sample product",
    };

    inventoryRepository.findInventoryByProductId.mockResolvedValue(
      existingInventory
    );

    const result = await logInventoryTrail.logInventoryTrail(
      productId,
      userId,
      qty
    );

    expect(result.status).toBe(false);
    expect(result.message).toBe("Quantity exceeds available stock.");
  });
});
