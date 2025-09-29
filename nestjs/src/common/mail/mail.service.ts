import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { SendMailOptions, MailModuleOptions } from './interfaces/mail.interface';

type Transporter = nodemailer.Transporter;

@Injectable()
export class MailService {
  private transporter: Transporter;
  private templatesDir = path.join(process.cwd(), 'src', 'common', 'mail', 'templates');
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor(private readonly configService: ConfigService) {
    const options: MailModuleOptions = {
      host: this.configService.get<string>('MAIL_HOST') || '',
      port: parseInt(this.configService.get<string>('MAIL_PORT') || '587', 10),
      secure: this.configService.get<string>('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('MAIL_USER') || '',
        pass: this.configService.get<string>('MAIL_PASSWORD') || '',
      },
      defaults: {
        from: this.configService.get<string>('MAIL_FROM') || '',
      },
    };

    this.transporter = nodemailer.createTransport(options);
    this.loadTemplates();
  }

  private loadTemplates() {
    const templateFiles = fs.readdirSync(this.templatesDir);
    
    templateFiles.forEach(file => {
      if (file.endsWith('.hbs')) {
        const templateName = path.basename(file, '.hbs');
        const templatePath = path.join(this.templatesDir, file);
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        this.templates.set(templateName, handlebars.compile(templateSource));
      }
    });
  }

  async sendMail(options: SendMailOptions): Promise<boolean> {
    try {
      const { to, subject, template, context = {} } = options;
      
      const templateFn = this.templates.get(template);
      if (!templateFn) {
        throw new Error(`Template ${template} not found`);
      }

      const html = templateFn({
        ...context,
        appName: this.configService.get('APP_NAME'),
        currentYear: new Date().getFullYear(),
      });

      await this.transporter.sendMail({
        to,
        from: this.configService.get('MAIL_FROM'),
        subject,
        html,
      });

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendValidationEmail(email: string, name: string, validationLink: string): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: 'Veuillez valider votre adresse email',
      template: 'email-verification',
      context: {
        name,
        validationLink,
      },
    });
  }

  async sendExaminerCredentials(
    email: string,
    name: string,
    tempPassword: string,
    loginLink: string
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: 'Vos identifiants d\'accès',
      template: 'examiner-credentials',
      context: {
        name,
        email,
        tempPassword,
        loginLink,
      },
    });
  }
}
