import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Configuration pour le service d'email (à configurer dans .env)
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    // Vérification de la connexion
    this.verifyConnection();
  }

  private async verifyConnection() {
    // En mode développement, on saute la vérification si aucun hôte n'est configuré
    if (this.configService.get<string>('NODE_ENV') === 'development' && 
        !this.configService.get<string>('EMAIL_HOST')) {
      this.logger.warn('SMTP not configured. Emails will be logged to console instead of being sent.');
      return;
    }

    try {
      const success = await this.transporter.verify();
      if (success) {
        this.logger.log('SMTP Server is ready to take our messages');
      }
    } catch (error) {
      this.logger.error('Error connecting to SMTP server. Emails will be logged to console instead.', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const mailOptions = {
      from: `"${this.configService.get<string>('EMAIL_FROM_NAME', 'Test')}" <${this.configService.get<string>('EMAIL_FROM', 'test@example.com')}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    // En mode développement sans SMTP configuré, on loggue l'email au lieu de l'envoyer
    if (this.configService.get<string>('NODE_ENV') === 'development' && 
        !this.configService.get<string>('EMAIL_HOST')) {
      this.logger.log('===== EMAIL NOT SENT - SMTP NOT CONFIGURED =====');
      this.logger.log('To:', mailOptions.to);
      this.logger.log('Subject:', mailOptions.subject);
      this.logger.log('Body (text):', mailOptions.text);
      this.logger.log('Body (html):', mailOptions.html);
      this.logger.log('================================================');
      return true; // On retourne true pour simuler un envoi réussi
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      // En cas d'échec d'envoi, on loggue l'erreur mais on continue l'exécution
      this.logger.error('Error sending email', error);
      
      // En développement, on loggue aussi l'email qui n'a pas pu être envoyé
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        this.logger.log('===== EMAIL FAILED TO SEND =====');
        this.logger.log('To:', mailOptions.to);
        this.logger.log('Subject:', mailOptions.subject);
        this.logger.log('Error:', error.message);
        this.logger.log('================================');
      }
      
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string, name: string): Promise<boolean> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth/verify-email?token=${token}`;
    
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
}
