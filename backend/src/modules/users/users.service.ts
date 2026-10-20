import { UserModel, IUser } from './users.model.js';

export class UsersService {
  async getById(id: string): Promise<IUser | null> {
    return UserModel.findOne({ _id: id, isDeleted: false })
      .populate('organizationId', 'name type address verified')
      .select('-passwordHash -refreshTokenHash');
  }

  async getByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase(), isDeleted: false });
  }

  async updateProfile(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findOneAndUpdate({ _id: id, isDeleted: false }, updates, { new: true }).select(
      '-passwordHash -refreshTokenHash'
    );
  }
}

export const usersService = new UsersService();
