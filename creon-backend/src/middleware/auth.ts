import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
      return;
    }

    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    req.user = {
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      
      if (user) {
        req.user = {
          id: (user._id as any).toString(),
          username: user.username,
          email: user.email,
          role: user.role
        };
      }
    }

    next();
  } catch (error) {
    next();
  }
};