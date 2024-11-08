## 📄 API Documentation for Inventory Service

The inventory management RESTful API follows an event-driven design (DDD). The application is modeled using clean architecture, utilizing the Controller, Service, and Repository layers to align with the DDD layer architecture. This architecture follows best practices in frameworks like Java Spring Boot. DDD consists of the **Application**, **Domain**, and **Infrastructure** layers, which map to the **Controller**, **Service**, and **Repository** layers respectively:

- **Controller Layer** → **Application Layer**: Handles external requests and coordinates data flow.
- **Service Layer** → **Domain Layer**: Manages business logic and enforces domain rules.
- **Repository Layer** → **Infrastructure Layer**: Handles data persistence and abstracts database interactions.

---

Base URL: http://localhost:5001

---

## Add and Remove Inventory

This endpoint allows clients to add or remove inventory items. Inventory includes details like `product_id`, `name`, `description`, and `stock_level`.

### **Stock Level**

- **Positive**: Adds inventory.
- **Negative**: Removes inventory.

### Request:

```bash
POST /v1/api/inventory

curl -X POST "http://localhost:5001/v1/api/inventory" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <Role-admin>" \
-d '{
  "product_id": "07a6965a-5aa9-4994-82d1-418f5a76e380",
  "name": "product_name",
  "description": "product_description",
  "stock_level": 12
}'
```

### Response: 201 Created

```bash
{
  "inventory": {
    "product_id": "07a6965a-5aa9-4994-82d1-418f5a76e380",
    "name": "product_name",
    "description": "product_description",
    "stock_level": 123,
    "_id": "672c864b68a247f4dc262418"
  },
  "status": 201
}
```

### Error Responses:

- 422 Unprocessable Entity:

```bash
{
  "message": "Updating stock level would result in a negative value."
}
```

- 400 Bad Request:

```bash
{
  "message": "Inventory Name is required and cannot be empty."
}
```

**Other Errors**:

- **400**: Invalid request data.
- **500**: Internal server error.

## Fetch Inventory Record by Product ID

Fetch an inventory record for a specific product ID.

### Request:

```bash
GET /v1/api/inventory/:product-id
```

```bash
curl -X GET "http://localhost:5001/v1/api/inventory/:product-id" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <Role-admin>"
```

### Response: 200 OK

```bash
{
  "inventory": {
    "product_id": "07a6965a-5aa9-4994-82d1-418f5a76e380",
    "name": "product_name",
    "description": "product_description",
    "stock_level": 123,
    "_id": "672c864b68a247f4dc262418"
  },
  "status": 200
}
```

### Error Responses:

- 404 Not Found:

```
{
  "message": "Failed to find inventory"
}
```

**Other Errors**:

- **400/404**: Invalid request data.
- **500**: Internal server error.

## Message Broker (Kafka)

- **Kafka Server Address**: `http://localhost:9092`
- **Security**: No security provided
- **Protocol**: No protocol buffer
- **Topic**: `inventory`

### Kafka Producer:

```bash
kafka-console-producer --topic inventory --bootstrap-server localhost:9092
```

### event/InventoryEventListeners.ts

The **InventoryEventListeners** class integrates with Kafka messaging. It listens for incoming requests from orderService. The responsibility for debiting inventory and logging entries in the inventory trail is delegated to **LogInventoryTrail.ts**, which is injected into **InventoryEventListeners** to handle business logic. This ensures proper inventory management by processing requests, validating inputs, checking stock levels, handling removals, and sending appropriate responses

### Jest & Supertest (logInventoryTrail)

Jest and Supertest are popular testing tools for Node. Testing the logic responsible for communicating with orderService to add and remove from the inventory service

```
npm test -- --config=jest.config.ts
```

#### Test Result.

![Alt text](./src/test/Screenshot%202024-11-08%20at%2010.04.37.png)

### Inventory Event Listeners Documentation

- **Overview:**
  The event/InventoryEventListeners class integrates Kafka messaging for inventory management. It processes inventory requests, validates them, checks stock levels, remove and sends appropriate responses.

Initialize and Start:

```bash
const inventoryRepository = new InventoryRepository();
```

-**_testing_**
evet/InventoryResponse.ts

```bash
const kafkaService = new InventoryEventListeners(inventoryRepository);
```

```bash
kafkaService.start();
```

## OrderService

#### view point of the orderservice

**OrderService** serves as a counterpart to **InventoryService**, with the key distinction that it sends requests to verify inventory levels, debit stock, and log deductions in the **InventoryService** (inventory-trail). The core business logic for handling these requests is encapsulated within LogInventoryTrail.ts. This service ensures seamless processing of inventory updates, including validation, stock level checks, and logging. Meanwhile, InventoryEventListeners in the **InventoryService** acts as a Kafka consumer, listening to events triggered by OrderService and delegating inventory-related tasks to LogInventoryTrail.ts for consistent and efficient inventory management.

Instructu
