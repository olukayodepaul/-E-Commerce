import express from "express";
import bodyParser from "body-parser";
import { InventoryController } from "../controllers/InventoryController";
import { AddInventoryService } from "../services/AddInventoryService";
import { GetInventoryService } from "../services/GetInventoryService";
import InventoryRepository from "../repositories/InventoryRepository";
import { InventoryRoutes } from "./InventoryRoutes";
import AppConfigurations from "../AppConfigurations";
import { InventoryEventListeners } from "../events/InventoryEventListeners";
import { LogInventoryTrail } from "../services/LogInventoryTrail";

const app = express();

class AppStarter {
  constructor() {
    this.setRouteAndMiddleware();
    this.startApp();
  }

  setRouteAndMiddleware() {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    const inventoryRepository = new InventoryRepository();
    const logInventoryTrail = new LogInventoryTrail(inventoryRepository);
    const addInventoryService = new AddInventoryService(inventoryRepository);
    const getInventoryService = new GetInventoryService(inventoryRepository);
    const inventoryController = new InventoryController(
      addInventoryService,
      getInventoryService
    );

    app.use("/v1/api", new InventoryRoutes(inventoryController).getRouter());
    const kafkaService = new InventoryEventListeners(logInventoryTrail);
    kafkaService.start();
  }

  startApp() {
    const port = new AppConfigurations().appConfiguration();
    const PORT = port.port;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${port.port}`);
    });
  }
}

new AppStarter();
