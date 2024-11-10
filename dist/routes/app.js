"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const InventoryController_1 = require("../controllers/InventoryController");
const AddInventoryService_1 = require("../services/AddInventoryService");
const GetInventoryService_1 = require("../services/GetInventoryService");
const InventoryRepository_1 = __importDefault(require("../repositories/InventoryRepository"));
const InventoryRoutes_1 = require("./InventoryRoutes");
const AppConfigurations_1 = __importDefault(require("../AppConfigurations"));
const InventoryEventListeners_1 = require("../events/InventoryEventListeners");
const LogInventoryTrail_1 = require("../services/LogInventoryTrail");
const app = (0, express_1.default)();
class AppStarter {
    constructor() {
        this.setRouteAndMiddleware();
        this.startApp();
    }
    setRouteAndMiddleware() {
        app.use(body_parser_1.default.json());
        app.use(body_parser_1.default.urlencoded({ extended: false }));
        const inventoryRepository = new InventoryRepository_1.default();
        const logInventoryTrail = new LogInventoryTrail_1.LogInventoryTrail(inventoryRepository);
        const addInventoryService = new AddInventoryService_1.AddInventoryService(inventoryRepository);
        const getInventoryService = new GetInventoryService_1.GetInventoryService(inventoryRepository);
        const inventoryController = new InventoryController_1.InventoryController(addInventoryService, getInventoryService);
        app.use("/v1/api", new InventoryRoutes_1.InventoryRoutes(inventoryController).getRouter());
        const kafkaService = new InventoryEventListeners_1.InventoryEventListeners(logInventoryTrail);
        kafkaService.start();
    }
    startApp() {
        const port = new AppConfigurations_1.default().appConfiguration();
        const PORT = port.port;
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${port.port}`);
        });
    }
}
new AppStarter();
