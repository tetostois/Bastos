import { ConfigService } from '@nestjs/config';
import { SendMailOptions } from './interfaces/mail.interface';
export declare class MailService {
    private readonly configService;
    private transporter;
    private templatesDir;
    private templates;
    constructor(configService: ConfigService);
    private loadTemplates;
    sendMail(options: SendMailOptions): Promise<boolean>;
    sendValidationEmail(email: string, name: string, validationLink: string): Promise<boolean>;
    sendExaminerCredentials(email: string, name: string, tempPassword: string, loginLink: string): Promise<boolean>;
}
