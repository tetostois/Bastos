"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const config_1 = require("@nestjs/config");
let EmailService = EmailService_1 = class EmailService {
    configService;
    transporter;
    logger = new common_1.Logger(EmailService_1.name);
    constructor(configService) {
        this.configService = configService;
        this.initializeTransporter();
    }
    initializeTransporter() {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('EMAIL_HOST'),
            port: this.configService.get('EMAIL_PORT'),
            secure: this.configService.get('EMAIL_SECURE'),
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASSWORD'),
            },
        });
        this.verifyConnection();
    }
    async verifyConnection() {
        if (this.configService.get('NODE_ENV') === 'development' &&
            !this.configService.get('EMAIL_HOST')) {
            this.logger.warn('SMTP not configured. Emails will be logged to console instead of being sent.');
            return;
        }
        try {
            const success = await this.transporter.verify();
            if (success) {
                this.logger.log('SMTP Server is ready to take our messages');
            }
        }
        catch (error) {
            this.logger.error('Error connecting to SMTP server. Emails will be logged to console instead.', error);
        }
    }
    async sendEmail(options) {
        const mailOptions = {
            from: `"${this.configService.get('EMAIL_FROM_NAME', 'Test')}" <${this.configService.get('EMAIL_FROM', 'test@example.com')}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };
        if (this.configService.get('NODE_ENV') === 'development' &&
            !this.configService.get('EMAIL_HOST')) {
            this.logger.log('===== EMAIL NOT SENT - SMTP NOT CONFIGURED =====');
            this.logger.log('To:', mailOptions.to);
            this.logger.log('Subject:', mailOptions.subject);
            this.logger.log('Body (text):', mailOptions.text);
            this.logger.log('Body (html):', mailOptions.html);
            this.logger.log('================================================');
            return true;
        }
        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent: ${info.messageId}`);
            return true;
        }
        catch (error) {
            this.logger.error('Error sending email', error);
            if (this.configService.get('NODE_ENV') === 'development') {
                this.logger.log('===== EMAIL FAILED TO SEND =====');
                this.logger.log('To:', mailOptions.to);
                this.logger.log('Subject:', mailOptions.subject);
                this.logger.log('Error:', error.message);
                this.logger.log('================================');
            }
            return false;
        }
    }
    async sendVerificationEmail(email, token, name) {
        const verificationUrl = `${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${token}`;
        const subject = 'Veuillez confirmer votre adresse email';
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bienvenue sur notre plateforme, ${name} !</h2>
        <p>Merci de vous être inscrit. Veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Confirmer mon email
          </a>
        </p>
        <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <p>Ce lien expirera dans 24 heures.</p>
        <p>Cordialement,<br>L'équipe de certification</p>
      </div>
    `;
        return this.sendEmail({
            to: email,
            subject,
            html,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map