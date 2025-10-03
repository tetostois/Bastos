"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenUtil = void 0;
const crypto_1 = require("crypto");
const util_1 = require("util");
const randomBytesAsync = (0, util_1.promisify)(crypto_1.randomBytes);
class TokenUtil {
    static async generateToken(length = 32) {
        const buffer = await randomBytesAsync(length);
        return buffer.toString('hex');
    }
    static getTokenExpiration(hours = 24) {
        const date = new Date();
        date.setHours(date.getHours() + hours);
        return date;
    }
    static isTokenExpired(expirationDate) {
        return new Date() > new Date(expirationDate);
    }
}
exports.TokenUtil = TokenUtil;
//# sourceMappingURL=token.util.js.map