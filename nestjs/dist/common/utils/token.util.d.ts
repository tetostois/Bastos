export declare class TokenUtil {
    static generateToken(length?: number): Promise<string>;
    static getTokenExpiration(hours?: number): Date;
    static isTokenExpired(expirationDate: Date): boolean;
}
