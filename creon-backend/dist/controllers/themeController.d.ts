import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getUserTheme: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateTheme: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPublicTheme: (req: Request, res: Response) => Promise<void>;
export declare const resetTheme: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=themeController.d.ts.map