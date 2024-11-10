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
const mongodb_1 = require("mongodb");
const Inventory_1 = require("../domain/Inventory");
const MongoDbConnnection_1 = __importDefault(require("../connection/MongoDbConnnection"));
const CustomError_1 = __importDefault(require("../error/CustomError"));
class InventoryRepository {
    constructor() {
        MongoDbConnnection_1.default.applyConnection();
        this.client = new mongodb_1.MongoClient(process.env.MONGO_DB_CONNECTION);
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
                this.db = this.client.db();
                this.collection = this.db.collection("inventory");
                this.inventoryTrail =
                    this.db.collection("inventory_trail");
            }
            catch (error) {
                throw new CustomError_1.default("Failed to connect to MongoDB", 500);
            }
        });
    }
    save(inventory) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield this.connect();
            try {
                const existingInventory = yield this.collection.findOne({
                    product_id: inventory.product_id,
                });
                if (existingInventory) {
                    const updatedInventory = yield this.collection.findOneAndUpdate({ product_id: inventory.product_id }, {
                        $inc: { stock_level: inventory.stock_level },
                        $set: { name: inventory.name, description: inventory.description },
                    }, { returnDocument: "after" });
                    if (updatedInventory) {
                        const mappedInventory = new Inventory_1.Inventory(updatedInventory.product_id, updatedInventory.name, updatedInventory.description, updatedInventory.stock_level, (_a = updatedInventory._id) === null || _a === void 0 ? void 0 : _a.toString());
                        return mappedInventory;
                    }
                    else {
                        throw new CustomError_1.default("Inventory update failed", 500);
                    }
                }
                else {
                    yield this.collection.insertOne(inventory);
                    return inventory;
                }
            }
            catch (error) {
                throw new CustomError_1.default("Failed to save inventory", 500);
            }
        });
    }
    findInventoryByProductId(product_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connect();
            try {
                const result = yield this.collection.findOne({ product_id });
                return result !== null && result !== void 0 ? result : null;
            }
            catch (error) {
                throw new CustomError_1.default("Failed to find inventory", 404);
            }
        });
    }
    removeItemFromInventory(productId, qty) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stockReduction = yield this.collection.findOneAndUpdate({ product_id: productId }, { $inc: { stock_level: -qty } }, { returnDocument: "after" });
                return { message: `${stockReduction === null || stockReduction === void 0 ? void 0 : stockReduction._id}`, status: true };
            }
            catch (err) {
                return { message: `${err}`, status: false };
            }
        });
    }
    logInventoryItem(trail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.connect();
                yield this.inventoryTrail.insertOne(trail);
                return trail;
            }
            catch (error) {
                throw new CustomError_1.default("Failed to save trail", 500);
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.close();
        });
    }
}
exports.default = InventoryRepository;
