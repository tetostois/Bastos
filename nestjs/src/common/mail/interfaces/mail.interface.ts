export interface SendMailOptions {
  to: string;
  subject: string;
  template: string;
  context?: Record<string, any>;
}

export interface MailModuleOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  defaults?: {
    from?: string;
  };
}
