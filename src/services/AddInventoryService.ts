import InventoryRepository from "../repositories/InventoryRepository";
import { Inventory } from "../domain/Inventory";
import CustomError from "../error/CustomError";
import { HttpStatus } from "../utils/HttpStatus";

export class AddInventoryService {
  constructor(
    private inventoryRepository: InventoryRepository
  ) {}

  async addInventory(itemData: {product_id: string; name: string; description: string; stock_level: number;}): 
  Promise<{ inventory: Inventory; status: number }> {
    
    this.validateName(itemData.name);
    this.validateProductId(itemData.product_id);
    this.validateDescription(itemData.description);
    this.validateStockLevel(itemData.stock_level);

    const inventory = new Inventory(
      itemData.product_id,
      itemData.name,
      itemData.description,
      itemData.stock_level
    )

    const updatedInventory = await this.updateInventoryStock(inventory);
    return { inventory: updatedInventory, status: HttpStatus.CREATED };
  }

  validateName(name: string) {
    this.validateField(name, "Inventory Name");
  }

  validateProductId(productId: string) {
    this.validateField(productId, "Product ID");
  }

  validateDescription(description: string) {
    this.validateField(description, "Inventory Description");
  }

  validateStockLevel(stockLevel: number) {
    if (typeof stockLevel !== "number") {
      throw new CustomError(
        `Invalid stock level: ${stockLevel} must be a numerical value.`,
        HttpStatus.BAD_REQUEST
      );
    }
    this.validateField(stockLevel, "Stock Level");
  }

  public validateField(field: any, fieldName: string) {
    if (!field || field === "") {
      throw new CustomError(
        `${fieldName} is required and cannot be empty.`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async updateInventoryStock(inventory: Inventory): Promise<Inventory> {
    const existingInventory =
      await this.inventoryRepository.findInventoryByProductId(
        inventory.product_id
      );

    if (existingInventory) {
      const newStockLevel =
        existingInventory.stock_level + inventory.stock_level;

      if (newStockLevel < 0) {
        throw new CustomError(
          `Updating stock level would result in a negative value (${newStockLevel}).`,
          HttpStatus.UNPROCCESSABLE_ENTRY
        );
      }

      const exist = await this.inventoryRepository.save(inventory);

      if (!exist) {
        throw new CustomError(
          `The record cant be save at this moment`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return exist;
    } else {
      if (inventory.stock_level < 0) {
        throw new CustomError(
          `Cannot initialize stock with a negative value (${inventory.stock_level}).`,
          HttpStatus.BAD_REQUEST
        );
      } else {
        await this.inventoryRepository.save(inventory);
        return inventory;
      }
    }
  }
}
