import { ShipmentModel, IShipment } from './logistics.model.js';
import { routingService } from '../../services/routing.service.js';

export class LogisticsService {
  async estimateRoute(origin: [number, number], destination: [number, number]) {
    return routingService.calculateRoute(
      { longitude: origin[0], latitude: origin[1] },
      { longitude: destination[0], latitude: destination[1] }
    );
  }

  async getShipmentByOrderId(orderId: string): Promise<IShipment | null> {
    return ShipmentModel.findOne({ orderId, isDeleted: false }).populate(
      'logisticsOrganizationId',
      'name phone contactEmail'
    );
  }

  async createShipment(data: Partial<IShipment>): Promise<IShipment> {
    const shipmentNumber = `SHP-${Date.now().toString().slice(-6)}`;
    return ShipmentModel.create({
      ...data,
      shipmentNumber,
    });
  }
}

export const logisticsService = new LogisticsService();
