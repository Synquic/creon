import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getAllUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateUserRole: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUsersByRole: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getRoleStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteUser: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=roleController.d.ts.map