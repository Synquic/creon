import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const trackEvent: (req: Request, res: Response) => Promise<void>;
export declare const getDashboardAnalytics: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getLinkAnalytics: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProductAnalytics: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=analyticsController.d.ts.map