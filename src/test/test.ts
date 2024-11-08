import { LogInventoryTrail } from "../services/LogInventoryTrail";
import InventoryRepository from "../repositories/InventoryRepository";
import { InventoryTrail } from "../domain/InventoryTrail";

jest.mock("../repositories/InventoryRepository");

describe("LogInventoryTrail Service", () => {
  let logInventoryTrail: LogInventoryTrail;
  let inventoryRepository: jest.Mocked<InventoryRepository>;

  beforeEach(() => {
    inventoryRepository =
      new InventoryRepository() as jest.Mocked<InventoryRepository>;
    logInventoryTrail = new LogInventoryTrail(inventoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should save inventory trail successfully", async () => {
    // Arrange
    const productId = "07a6965a-5aa9-4994-82d1-418f5a76e380";
    const userId = "user-123";
    const quantity = 5;
    const expectedTrail = new InventoryTrail(productId, userId, quantity);
    inventoryRepository.logInventoryItem.mockResolvedValue(expectedTrail);

    // Act
    const result = await logInventoryTrail.logInventoryTrail(
      productId,
      userId,
      quantity
    );

    // Assert
    expect(result).toEqual({
      status: true,
      message: "record save successfully",
    });
    expect(inventoryRepository.logInventoryItem).toHaveBeenCalledWith(
      expectedTrail
    );
  });

  it("should throw an error for invalid quantity", async () => {
    // Act and Assert
    await expect(
      logInventoryTrail.logInventoryTrail("prod-1", "user-1", -1)
    ).rejects.toThrow("Invalid quabtity");
  });

  it("should return an error if saveTrail fails", async () => {
    // Arrange
    const productId = "07a6965a-5aa9-4994-82d1-418f5a76e380";
    const userId = "user-123";
    const quantity = 5;
    inventoryRepository.logInventoryItem.mockResolvedValue(null as any);

    // Act
    const result = await logInventoryTrail.logInventoryTrail(
      productId,
      userId,
      quantity
    );

    // Assert
    expect(result).toEqual({ status: false, message: "record not save" });
  });

  it("should send data to the repository", async () => {
    const productId = "123";
    const userId = "456";
    const qty = 10;
    const inventoryTrail = new InventoryTrail(productId, userId, qty);

    inventoryRepository.logInventoryItem.mockResolvedValue(true);

    const result = await logInventoryTrail.logInventoryTrail(
      productId,
      userId,
      qty
    );

    expect(inventoryRepository.logInventoryItem).toHaveBeenCalledWith(
      inventoryTrail
    );
    expect(result.status).toBe(true);
    expect(result.message).toBe("record save successfully");
  });

  it("should return error if save fails", async () => {
    const productId = "123";
    const userId = "456";
    const qty = 10;
    const inventoryTrail = new InventoryTrail(productId, userId, qty);

    inventoryRepository.logInventoryItem.mockResolvedValue(false);

    const result = await logInventoryTrail.logInventoryTrail(
      productId,
      userId,
      qty
    );

    expect(inventoryRepository.logInventoryItem).toHaveBeenCalledWith(
      inventoryTrail
    );
    expect(result.status).toBe(false);
    expect(result.message).toBe("record not save");
  });
});
