import { MaterialModel, IMaterial } from './materials.model.js';

export interface MaterialQueryParams {
  page: number;
  limit: number;
  materialType?: string;
  status?: string;
  lng?: number;
  lat?: number;
  maxDistanceKm?: number;
}

export class MaterialsService {
  async list(params: MaterialQueryParams) {
    const query: Record<string, any> = { isDeleted: false };

    if (params.materialType) {
      query.materialType = params.materialType;
    }
    if (params.status) {
      query.status = params.status;
    } else {
      query.status = 'available';
    }

    if (params.lng !== undefined && params.lat !== undefined) {
      const maxDistanceMeters = (params.maxDistanceKm || 50) * 1000;
      query['pickupLocation.location'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [params.lng, params.lat],
          },
          $maxDistance: maxDistanceMeters,
        },
      };
    }

    const skip = (params.page - 1) * params.limit;
    const [data, total] = await Promise.all([
      MaterialModel.find(query)
        .populate('sellerOrganizationId', 'name type address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(params.limit),
      MaterialModel.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getById(id: string): Promise<IMaterial | null> {
    return MaterialModel.findOne({ _id: id, isDeleted: false }).populate(
      'sellerOrganizationId',
      'name type address contactEmail phone verified'
    );
  }

  async create(data: Partial<IMaterial>): Promise<IMaterial> {
    return MaterialModel.create(data);
  }

  async update(id: string, updates: Partial<IMaterial>): Promise<IMaterial | null> {
    return MaterialModel.findOneAndUpdate({ _id: id, isDeleted: false }, updates, { new: true });
  }

  async softDelete(id: string): Promise<IMaterial | null> {
    return MaterialModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
  }
}

export const materialsService = new MaterialsService();
