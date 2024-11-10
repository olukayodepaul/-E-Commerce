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
exports.GetInventoryService = void 0;
const CustomError_1 = __importDefault(require("../error/CustomError"));
const HttpStatus_1 = require("../utils/HttpStatus");
class GetInventoryService {
    constructor(inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }
    fetchStock(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingInventory = yield this.inventoryRepository.findInventoryByProductId(productId);
            if (!!existingInventory && Object.keys(existingInventory).length) {
                return { inventory: existingInventory, status: HttpStatus_1.HttpStatus.OK };
            }
            throw new CustomError_1.default(`${productId} stock not found with the provided product id`, HttpStatus_1.HttpStatus.NOT_FOUND);
        });
    }
    validateProductId(productId) {
        this.validateField(productId, "Product id");
    }
    validateField(field, fieldName) {
        if (!field || field === "") {
            throw new CustomError_1.default(`${fieldName} is required and cannot be empty.`, HttpStatus_1.HttpStatus.BAD_REQUEST);
        }
    }
}
exports.GetInventoryService = GetInventoryService;