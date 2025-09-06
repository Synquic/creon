import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createLink: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getLinks: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getLinkById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateLink: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteLink: (req: AuthRequest, res: Response) => Promise<void>;
export declare const reorderLinks: (req: AuthRequest, res: Response) => Promise<void>;
export declare const redirectLink: (req: Request, res: Response) => Promise<void>;
export declare const getLinkAnalytics: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=linkController.d.ts.map