export class KafkaInventoryPayload {
  status: boolean;
  topic: string;
  payload: KafkaMessage;

  constructor(status: boolean, topic: string, payload: KafkaMessage) {
    this.status = status;
    this.topic = topic;
    this.payload = payload;
  }
}

export class KafkaMessage {
  _id: string;
  product_id: string;
  name: string;
  description: string;
  stock_level: number;

  constructor(
    product_id: string,
    name: string,
    description: string,
    stock_level: number,
    _id: string
  ) {
    this.product_id = product_id;
    this.name = name;
    this.description = description;
    this.stock_level = stock_level;
    this._id = _id;
  }
}