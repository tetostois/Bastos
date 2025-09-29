import { randomBytes } from 'crypto';
import { promisify } from 'util';

const randomBytesAsync = promisify(randomBytes);

export class TokenUtil {
  /**
   * Generate a random token for email verification
   * @param length Length of the token in bytes (default: 32)
   * @returns A promise that resolves to a hex-encoded token
   */
  static async generateToken(length: number = 32): Promise<string> {
    const buffer = await randomBytesAsync(length);
    return buffer.toString('hex');
  }

  /**
   * Calculate expiration date for the token
   * @param hours Number of hours until expiration (default: 24)
   * @returns A Date object representing the expiration time
   */
  static getTokenExpiration(hours: number = 24): Date {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return date;
  }

  /**
   * Check if a token is expired
   * @param expirationDate The expiration date to check against
   * @returns boolean indicating if the token is expired
   */
  static isTokenExpired(expirationDate: Date): boolean {
    return new Date() > new Date(expirationDate);
  }
}
