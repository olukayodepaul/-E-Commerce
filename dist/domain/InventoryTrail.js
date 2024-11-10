"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryTrail = void 0;
class InventoryTrail {
    constructor(product_id, user_id, qty, _id) {
        this.product_id = product_id;
        this.qty = qty;
        this.user_id = user_id;
        this._id = _id;
    }
}
exports.InventoryTrail = InventoryTrail;
