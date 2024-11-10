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
const LogInventoryTrail_1 = require("../services/LogInventoryTrail");
const InventoryRepository_1 = __importDefault(require("../repositories/InventoryRepository"));
const InventoryTrail_1 = require("../domain/InventoryTrail");
jest.mock("../repositories/InventoryRepository");
describe("LogInventoryTrail Service", () => {
    let logInventoryTrail;
    let inventoryRepository;
    beforeEach(() => {
        inventoryRepository =
            new InventoryRepository_1.default();
        logInventoryTrail = new LogInventoryTrail_1.LogInventoryTrail(inventoryRepository);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should save inventory trail successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const productId = "07a6965a-5aa9-4994-82d1-418f5a76e380";
        const userId = "user-123";
        const quantity = 5;
        const existingInventory = {
            product_id: productId,
            stock_level: 10,
            name: "Product A", // Add missing fields based on Inventory model
            description: "Sample product",
        };
        const expectedTrail = new InventoryTrail_1.InventoryTrail(productId, userId, quantity);
        inventoryRepository.findInventoryByProductId.mockResolvedValue(existingInventory);
        inventoryRepository.removeItemFromInventory.mockResolvedValue({
            status: true,
            message: "Inventory updated successfully", // Include message
        });
        inventoryRepository.logInventoryItem.mockResolvedValue(expectedTrail); // Returns the trail on success
        const result = yield logInventoryTrail.logInventoryTrail(productId, userId, quantity);
        expect(result).toEqual({
            status: true,
            message: "Inventory trail logged successfully",
        });
        expect(inventoryRepository.logInventoryItem).toHaveBeenCalledWith(expectedTrail);
    }));
    it("should return error if save fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const productId = "123";
        const userId = "456";
        const qty = 10;
        const inventoryTrail = new InventoryTrail_1.InventoryTrail(productId, userId, qty);
        inventoryRepository.logInventoryItem.mockRejectedValueOnce(new Error("Failed to log inventory trail"));
        const result = yield logInventoryTrail.logInventoryTrail(productId, userId, qty);
        expect(inventoryRepository.logInventoryItem).toHaveBeenCalledWith(inventoryTrail);
        expect(result.status).toBe(false);
        expect(result.message).toBe("Failed to log inventory trail.");
    }));
    it("should return error if product not found in inventory", () => __awaiter(void 0, void 0, void 0, function* () {
        const productId = "nonexistent-id";
        const userId = "user-123";
        const qty = 5;
        inventoryRepository.findInventoryByProductId.mockResolvedValue(null); // Simulate not found inventory
        const result = yield logInventoryTrail.logInventoryTrail(productId, userId, qty);
        expect(result.status).toBe(false);
        expect(result.message).toBe("Product not found in inventory.");
    }));
    it("should return error if quantity exceeds available stock", () => __awaiter(void 0, void 0, void 0, function* () {
        const productId = "07a6965a-5aa9-4994-82d1-418f5a76e380";
        const userId = "user-123";
        const qty = 20;
        const existingInventory = {
            product_id: productId,
            stock_level: 10,
            name: "Product A", // Add missing fields
            description: "Sample product",
        };
        inventoryRepository.findInventoryByProductId.mockResolvedValue(existingInventory);
        const result = yield logInventoryTrail.logInventoryTrail(productId, userId, qty);
        expect(result.status).toBe(false);
        expect(result.message).toBe("Quantity exceeds available stock.");
    }));
});
