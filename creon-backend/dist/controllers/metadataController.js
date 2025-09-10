"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMetadata = void 0;
const urlMetadata_1 = require("../services/urlMetadata");
const index_1 = require("../index");
const fetchMetadata = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            res.status(400).json({
                success: false,
                message: 'URL is required'
            });
            return;
        }
        try {
            new URL(url);
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: 'Invalid URL format'
            });
            return;
        }
        let metadata;
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            metadata = await (0, urlMetadata_1.fetchYouTubeMetadata)(url);
        }
        else {
            metadata = await (0, urlMetadata_1.fetchURLMetadata)(url);
        }
        res.json({
            success: true,
            data: metadata
        });
    }
    catch (error) {
        index_1.logger.error('Fetch metadata error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch metadata'
        });
    }
};
exports.fetchMetadata = fetchMetadata;
//# sourceMappingURL=metadataController.js.map