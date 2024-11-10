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
exports.AddInventoryService = void 0;
const Inventory_1 = require("../domain/Inventory");
const CustomError_1 = __importDefault(require("../error/CustomError"));
const HttpStatus_1 = require("../utils/HttpStatus");
class AddInventoryService {
    constructor(inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }
    addInventory(itemData) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateName(itemData.name);
            this.validateProductId(itemData.product_id);
            this.validateDescription(itemData.description);
            this.validateStockLevel(itemData.stock_level);
            const inventory = new Inventory_1.Inventory(itemData.product_id, itemData.name, itemData.description, itemData.stock_level);
            const updatedInventory = yield this.updateInventoryStock(inventory);
            return { inventory: updatedInventory, status: HttpStatus_1.HttpStatus.CREATED };
        });
    }
    validateName(name) {
        this.validateField(name, "Inventory Name");
    }
    validateProductId(productId) {
        this.validateField(productId, "Product ID");
    }
    validateDescription(description) {
        this.validateField(description, "Inventory Description");
    }
    validateStockLevel(stockLevel) {
        if (typeof stockLevel !== "number") {
            throw new CustomError_1.default(`Invalid stock level: ${stockLevel} must be a numerical value.`, HttpStatus_1.HttpStatus.BAD_REQUEST);
        }
        this.validateField(stockLevel, "Stock Level");
    }
    validateField(field, fieldName) {
        if (!field || field === "") {
            throw new CustomError_1.default(`${fieldName} is required and cannot be empty.`, HttpStatus_1.HttpStatus.BAD_REQUEST);
        }
    }
    updateInventoryStock(inventory) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingInventory = yield this.inventoryRepository.findInventoryByProductId(inventory.product_id);
            if (existingInventory) {
                const newStockLevel = existingInventory.stock_level + inventory.stock_level;
                if (newStockLevel < 0) {
                    throw new CustomError_1.default(`Updating stock level would result in a negative value (${newStockLevel}).`, HttpStatus_1.HttpStatus.UNPROCCESSABLE_ENTRY);
                }
                const exist = yield this.inventoryRepository.save(inventory);
                if (!exist) {
                    throw new CustomError_1.default(`The record cant be save at this moment`, HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
                return exist;
            }
            else {
                if (inventory.stock_level < 0) {
                    throw new CustomError_1.default(`Cannot initialize stock with a negative value (${inventory.stock_level}).`, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                else {
                    yield this.inventoryRepository.save(inventory);
                    return inventory;
                }
            }
        });
    }
}
exports.AddInventoryService = AddInventoryService;
