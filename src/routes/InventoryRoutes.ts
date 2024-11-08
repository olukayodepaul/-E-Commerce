import { Router } from "express";
import { InventoryController } from "../controllers/InventoryController";

export class InventoryRoutes {
  private router: Router;

  constructor(private inventoryController: InventoryController) {
    this.router = Router();
    this.configureRoutes();
  }

  private configureRoutes() {
    this.router.post("/inventory", async (req, res) => {
      this.inventoryController.addInventory(req, res);
    });

    this.router.get("/inventory/:product_id", async (req, res) => {
      this.inventoryController.getInventory(req, res);
    });
  }

  getRouter() {
    return this.router;
  }
}
