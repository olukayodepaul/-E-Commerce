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
const mongoose_1 = __importDefault(require("mongoose"));
const AppConfigurations_1 = __importDefault(require("../AppConfigurations"));
class MongoDbConnection {
    static applyConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const connectionString = new AppConfigurations_1.default().appConfiguration()
                .mongodb;
            try {
                const connection = yield mongoose_1.default.connect(connectionString);
                console.log("Connected to MongoDB");
                return connection;
            }
            catch (error) {
                console.error("Error connecting to MongoDB:", error);
                process.exit(1);
            }
        });
    }
}
exports.default = MongoDbConnection;
