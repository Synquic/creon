export declare const generateShortCode: (length?: number) => string;
export declare const generateUniqueShortCode: (checkFunction: (code: string) => Promise<boolean>, length?: number, maxAttempts?: number) => Promise<string>;
export declare const isValidShortCode: (code: string) => boolean;
//# sourceMappingURL=shortCode.d.ts.map