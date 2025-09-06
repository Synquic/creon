import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

interface TokenPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
    issuer: 'creon-api'
  } as any);
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign({ id: userId, type: 'refresh' }, secret, {
    expiresIn: '30d',
    issuer: 'creon-api'
  } as any);
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  try {
    const decoded = jwt.verify(token, secret) as any;
    
    if (decoded.type === 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw error;
  }
};

export const verifyRefreshToken = (token: string): { id: string } => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  try {
    const decoded = jwt.verify(token, secret) as any;
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return { id: decoded.id };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    throw error;
  }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};