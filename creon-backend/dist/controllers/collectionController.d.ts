import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const createCollection: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCollections: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCollectionById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateCollection: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteCollection: (req: AuthRequest, res: Response) => Promise<void>;
export declare const reorderCollections: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addProductToCollection: (req: AuthRequest, res: Response) => Promise<void>;
export declare const removeProductFromCollection: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=collectionController.d.ts.map