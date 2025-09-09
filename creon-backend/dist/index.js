"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("./config/database"));
const rateLimiting_1 = require("./middleware/rateLimiting");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const links_1 = __importDefault(require("./routes/links"));
const products_1 = __importDefault(require("./routes/products"));
const collections_1 = __importDefault(require("./routes/collections"));
const upload_1 = __importDefault(require("./routes/upload"));
const redirect_1 = __importDefault(require("./routes/redirect"));
const metadata_1 = __importDefault(require("./routes/metadata"));
const theme_1 = __importDefault(require("./routes/theme"));
const roles_1 = __importDefault(require("./routes/roles"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const shopSettings_1 = __importDefault(require("./routes/shopSettings"));
const dataParsing_1 = __importDefault(require("./routes/dataParsing"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
(0, database_1.default)();
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use(rateLimiting_1.generalLimiter);
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/links', links_1.default);
app.use('/api/products', products_1.default);
app.use('/api/collections', collections_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/metadata', metadata_1.default);
app.use('/api/theme', theme_1.default);
app.use('/api/roles', roles_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/shop', shopSettings_1.default);
app.use('/api/data-parsing', dataParsing_1.default);
app.use('/', redirect_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Creon API is running',
        timestamp: new Date().toISOString()
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error'
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Creon API server is running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5174'}`);
});
//# sourceMappingURL=index.js.map