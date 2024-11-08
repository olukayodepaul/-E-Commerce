import { Request, Response, NextFunction } from "express";
import { AddInventoryService } from "../services/AddInventoryService";
import { GetInventoryService } from "../services/GetInventoryService";
import CustomError from "../error/CustomError";

export class InventoryController {
  constructor(
    private addInventoryService: AddInventoryService,
    private fetchInventoryService: GetInventoryService
  ) {}

  async addInventory(req: Request, res: Response): Promise<void> {
    try {
      const inventory = await this.addInventoryService.addInventory(req.body);
      res.status(201).json(inventory);
    } catch (err) {
      console.log(err);
      if (err instanceof CustomError) {
        res.status(err.statusCode).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  async getInventory(req: Request, res: Response): Promise<void> {
    try {
      const { product_id } = req.params;
      console.log(product_id);
      const inventory = await this.fetchInventoryService.fetchStock(product_id);
      res.status(200).json(inventory);
    } catch (err) {
      console.log(err);
      if (err instanceof CustomError) {
        res.status(err.statusCode).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
}
