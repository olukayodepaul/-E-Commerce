import InventoryRepository from "../repositories/InventoryRepository";
import { Inventory } from "../domain/Inventory";
import CustomError from "../error/CustomError";
import { HttpStatus } from "../utils/HttpStatus";

export class GetInventoryService {
  constructor(private inventoryRepository: InventoryRepository) {}

  async fetchStock(
    productId: string
  ): Promise<{ inventory: Inventory; status: number }> {
    const existingInventory =
      await this.inventoryRepository.findInventoryByProductId(productId);

    if (!!existingInventory && Object.keys(existingInventory).length) {
      return { inventory: existingInventory, status: HttpStatus.OK };
    }

    throw new CustomError(
      `${productId} stock not found with the provided product id`,
      HttpStatus.NOT_FOUND
    );
  }

  validateProductId(productId: string) {
    this.validateField(productId, "Product id");
  }

  public validateField(field: any, fieldName: string) {
    if (!field || field === "") {
      throw new CustomError(
        `${fieldName} is required and cannot be empty.`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
