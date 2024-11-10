import InventoryRepository from "../repositories/InventoryRepository";
import { InventoryTrail } from "../domain/InventoryTrail";

interface ValidationResult {
  status: boolean;
  message: string;
}

export class LogInventoryTrail {
  private inventoryRepository: InventoryRepository;

  constructor(inventoryRepository: InventoryRepository) {
    this.inventoryRepository = inventoryRepository;
  }

  async logInventoryTrail(
    product_id: string,
    user_id: string,
    qty: number
  ): Promise<{ status: boolean; message: string }> {
    const validation = this.validateInput({ product_id, user_id, qty });

    if (!validation.status) {
      return { status: false, message: validation.message };
    }

    const existingInventory =
      await this.inventoryRepository.findInventoryByProductId(product_id);

    if (!existingInventory || existingInventory.stock_level === undefined) {
      return { status: false, message: "Product not found in inventory." };
    }

    if (qty > existingInventory.stock_level) {
      return { status: false, message: "Quantity exceeds available stock." };
    }

    const removeItemFromInventory =
      await this.inventoryRepository.removeItemFromInventory(product_id, qty);

    if (!removeItemFromInventory.status) {
      return {
        status: false,
        message: "Failed to update inventory. Please try again.",
      };
    }

    const trail = new InventoryTrail(product_id, user_id, qty);
    const logResult = await this.inventoryRepository.logInventoryItem(trail);

    if (!logResult) {
      return { status: false, message: "Failed to log inventory trail." };
    }

    return { status: true, message: "Inventory trail logged successfully." };
  }

  private validateInput({
    product_id,
    user_id,
    qty,
  }: {
    product_id: string;
    user_id: string;
    qty: number;
  }): ValidationResult {
    if (!product_id || !user_id || qty <= 0 || isNaN(qty)) {
      return {
        status: false,
        message:
          "Product ID, User ID, and Quantity are required. Quantity must be a positive number.",
      };
    }
    return { status: true, message: "" };
  }
}
