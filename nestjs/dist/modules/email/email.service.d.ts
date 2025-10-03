import { ConfigService } from '@nestjs/config';
export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare class EmailService {
    private configService;
    private transporter;
    private readonly logger;
    constructor(configService: ConfigService);
    private initializeTransporter;
    private verifyConnection;
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendVerificationEmail(email: string, token: string, name: string): Promise<boolean>;
}
