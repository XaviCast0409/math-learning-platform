import nodemailer from 'nodemailer';

const USER_EMAIL = process.env.USER_EMAIL || 'xavier.mont.0409@gmail.com';
const PASS_EMAIL = process.env.PASS_EMAIL || '';

export class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: USER_EMAIL,
                pass: PASS_EMAIL
            }
        });
    }

    async sendVerificationEmail(email: string, code: string, fullName: string) {
        const mailOptions = {
            from: `"XaviPlay 🎓" <${USER_EMAIL}>`,
            to: email,
            subject: '🔐 Código de Verificación - XaviPlay',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 900;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
            }
            .code-container {
              background: #f8f9fa;
              border: 3px dashed #667eea;
              border-radius: 12px;
              padding: 30px;
              margin: 30px 0;
            }
            .code {
              font-size: 48px;
              font-weight: 900;
              letter-spacing: 12px;
              color: #667eea;
              font-family: 'Courier New', monospace;
            }
            .info {
              color: #666;
              font-size: 14px;
              line-height: 1.6;
              margin-top: 20px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin-top: 20px;
              text-align: left;
              font-size: 13px;
              color: #856404;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 XaviPlay</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">¡Bienvenido a la Aventura de Aprender!</p>
            </div>
            <div class="content">
              <p class="greeting">¡Hola, <strong>${fullName}</strong>! 👋</p>
              <p style="color: #666; font-size: 16px;">
                Estamos emocionados de tenerte con nosotros. Para completar tu registro, 
                por favor ingresa el siguiente código de verificación:
              </p>
              <div class="code-container">
                <div class="code">${code}</div>
              </div>
              <p class="info">
                Este código es válido por <strong>10 minutos</strong>.<br>
                Si no solicitaste este código, puedes ignorar este correo.
              </p>
              <div class="warning">
                ⚠️ <strong>Importante:</strong> Nunca compartas este código con nadie. 
                El equipo de XaviPlay nunca te pedirá este código por teléfono o email.
              </div>
            </div>
            <div class="footer">
              <p>© 2026 XaviPlay - Plataforma de Aprendizaje</p>
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
        </html>
      `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email enviado a ${email}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error enviando email:', error);
            throw new Error('No se pudo enviar el correo de verificación');
        }
    }
}

export const emailService = new EmailService();
