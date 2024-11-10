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
exports.InventoryController = void 0;
const CustomError_1 = __importDefault(require("../error/CustomError"));
class InventoryController {
    constructor(addInventoryService, fetchInventoryService) {
        this.addInventoryService = addInventoryService;
        this.fetchInventoryService = fetchInventoryService;
    }
    addInventory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const inventory = yield this.addInventoryService.addInventory(req.body);
                res.status(201).json(inventory);
            }
            catch (err) {
                console.log(err);
                if (err instanceof CustomError_1.default) {
                    res.status(err.statusCode).json({ message: err.message });
                }
                else {
                    res.status(500).json({ message: "Internal Server Error" });
                }
            }
        });
    }
    getInventory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { product_id } = req.params;
                console.log(product_id);
                const inventory = yield this.fetchInventoryService.fetchStock(product_id);
                res.status(200).json(inventory);
            }
            catch (err) {
                console.log(err);
                if (err instanceof CustomError_1.default) {
                    res.status(err.statusCode).json({ message: err.message });
                }
                else {
                    res.status(500).json({ message: "Internal Server Error" });
                }
            }
        });
    }
}
exports.InventoryController = InventoryController;
