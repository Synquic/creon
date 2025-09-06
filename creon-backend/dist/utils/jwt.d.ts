interface TokenPayload {
    id: string;
    username: string;
    email: string;
    role: string;
}
export declare const generateToken: (payload: TokenPayload) => string;
export declare const generateRefreshToken: (userId: string) => string;
export declare const verifyToken: (token: string) => TokenPayload;
export declare const verifyRefreshToken: (token: string) => {
    id: string;
};
export declare const extractTokenFromHeader: (authHeader: string | undefined) => string | null;
export {};
//# sourceMappingURL=jwt.d.ts.map