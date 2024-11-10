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
exports.InventoryRoutes = void 0;
const express_1 = require("express");
class InventoryRoutes {
    constructor(inventoryController) {
        this.inventoryController = inventoryController;
        this.router = (0, express_1.Router)();
        this.configureRoutes();
    }
    configureRoutes() {
        this.router.post("/inventory", (req, res) => __awaiter(this, void 0, void 0, function* () {
            this.inventoryController.addInventory(req, res);
        }));
        this.router.get("/inventory/:product_id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            this.inventoryController.getInventory(req, res);
        }));
    }
    getRouter() {
        return this.router;
    }
}
exports.InventoryRoutes = InventoryRoutes;
