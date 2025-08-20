import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import database from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface GraphQLContext {
  user?: any;
}

export const createContext = async ({ req }: { req: any }): Promise<GraphQLContext> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return {};
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const usersCollection = database.getCollection('users');
    
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!user) {
      return {};
    }

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    return {};
  }
};
