"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConstants = void 0;
exports.jwtConstants = {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '1d',
    refreshExpiresIn: '7d',
};
//# sourceMappingURL=jwt.config.js.map