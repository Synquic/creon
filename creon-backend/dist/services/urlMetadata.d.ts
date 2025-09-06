export interface URLMetadata {
    title?: string;
    description?: string;
    image?: string;
    price?: string;
    currency?: string;
    siteName?: string;
    type?: string;
    url: string;
}
export declare const fetchURLMetadata: (url: string) => Promise<URLMetadata>;
export declare const fetchYouTubeMetadata: (url: string) => Promise<URLMetadata>;
//# sourceMappingURL=urlMetadata.d.ts.map