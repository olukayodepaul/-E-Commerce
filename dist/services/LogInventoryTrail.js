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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogInventoryTrail = void 0;
const InventoryTrail_1 = require("../domain/InventoryTrail");
class LogInventoryTrail {
    constructor(inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }
    logInventoryTrail(product_id, user_id, qty) {
        return __awaiter(this, void 0, void 0, function* () {
            const validation = this.validateInput({ product_id, user_id, qty });
            if (!validation.status) {
                return { status: false, message: validation.message };
            }
            const existingInventory = yield this.inventoryRepository.findInventoryByProductId(product_id);
            if (!existingInventory || existingInventory.stock_level === undefined) {
                return { status: false, message: "Product not found in inventory." };
            }
            if (qty > existingInventory.stock_level) {
                return { status: false, message: "Quantity exceeds available stock." };
            }
            const removeItemFromInventory = yield this.inventoryRepository.removeItemFromInventory(product_id, qty);
            if (!removeItemFromInventory.status) {
                return {
                    status: false,
                    message: "Failed to update inventory. Please try again.",
                };
            }
            const trail = new InventoryTrail_1.InventoryTrail(product_id, user_id, qty);
            const logResult = yield this.inventoryRepository.logInventoryItem(trail);
            if (!logResult) {
                return { status: false, message: "Failed to log inventory trail." };
            }
            return { status: true, message: "Inventory trail logged successfully." };
        });
    }
    validateInput({ product_id, user_id, qty, }) {
        if (!product_id || !user_id || qty <= 0 || isNaN(qty)) {
            return {
                status: false,
                message: "Product ID, User ID, and Quantity are required. Quantity must be a positive number.",
            };
        }
        return { status: true, message: "" };
    }
}
exports.LogInventoryTrail = LogInventoryTrail;
