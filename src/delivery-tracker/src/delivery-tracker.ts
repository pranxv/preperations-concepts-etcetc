type DeliveryStatus = "unpaid" | "paid";

type Delivery = {
  deliveryId: string;
  driverId: string;
  startTime: number;
  endTime: number;
  cost: number;
  status: DeliveryStatus;
};

type Driver = {
  driverId: string;
  name: string;
};

class DeliveryCostTracker {
  private drivers: Map<string, Driver> = new Map();
  private deliveries: Map<string, Delivery> = new Map();
  private totalCost: number = 0;
  private readonly RATE_PER_MINUTE = 10;
  add_driver(driverId: string, name: string): void {
    if (this.drivers.has(driverId)) return;
    this.drivers.set(driverId, { driverId, name });
  }
  add_delivery(driverId: string, startTime: number, endTime: number): void {
    if (!this.drivers.has(driverId)) {
      throw new Error(`Driver with ${driverId} does not exist`);
    }

    const durationInMinutes = (endTime - startTime) / (1000 * 60);
    const current_cost = this.RATE_PER_MINUTE * durationInMinutes;
    this.totalCost += current_cost;

    const delivery: Delivery = {
      deliveryId: crypto.randomUUID(),
      driverId,
      startTime,
      endTime,
      cost: current_cost,
      status: "unpaid",
    };
    this.deliveries.set(delivery.deliveryId, delivery);
  }

  get_total_cost(): number {
    return this.totalCost;
  }
  pay_up_to_time(timestamp: number): void {
    for (const delivery of this.deliveries.values()) {
      if (delivery.status === "unpaid" && delivery.endTime <= timestamp) {
        delivery.status = "paid";
      }
    }
  }

  get_cost_to_be_paid(): number {
    let costToBePaid = 0;
    for (const delivery of this.deliveries.values()) {
      if (delivery.status === "unpaid") {
        costToBePaid += delivery.cost;
      }
    }
    return costToBePaid;
  }
}


const tracker = new DeliveryCostTracker();

tracker.add_driver('driver-1', 'Ravi');

const now = Date.now();
tracker.add_delivery('driver-1', now - 60 * 60 * 1000, now - 30 * 60 * 1000); // 30 min delivery
tracker.add_delivery('driver-1', now - 20 * 60 * 1000, now - 10 * 60 * 1000); // 10 min delivery

console.log('Total cost:', tracker.get_total_cost());           // 400 (30*10 + 10*10)
console.log('Cost to be paid:', tracker.get_cost_to_be_paid()); // 400

tracker.pay_up_to_time(now - 15 * 60 * 1000); // pay everything before 15 min ago

console.log('After payment:');
console.log('Total cost:', tracker.get_total_cost());           // still 400
console.log('Cost to be paid:', tracker.get_cost_to_be_paid()); // 100 (only 10 min delivery unpaid)