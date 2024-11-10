"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
class Inventory {
    constructor(product_id, name, description, stock_level, _id) {
        this.product_id = product_id;
        this.name = name;
        this.description = description;
        this.stock_level = stock_level;
        this._id = _id;
    }
}
exports.Inventory = Inventory;
