import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProducts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProductById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const redirectProduct: (req: Request, res: Response) => Promise<void>;
export declare const getProductAnalytics: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=productController.d.ts.map