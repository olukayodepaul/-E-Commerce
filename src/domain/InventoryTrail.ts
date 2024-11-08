export class InventoryTrail {
  _id?: string;
  product_id: string;
  user_id: string;
  qty: number;

  constructor(product_id: string, user_id: string, qty: number, _id?: string) {
    this.product_id = product_id;
    this.qty = qty;
    this.user_id = user_id;
    this._id = _id;
  }
}
