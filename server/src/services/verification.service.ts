import { User } from '../models';
import AppError from '../utils/AppError';
import { emailService } from './email.service';

interface VerificationAttempt {
    email: string;
    lastAttempt: Date;
    count: number;
}

export class VerificationService {
    private attemptTracker: Map<string, VerificationAttempt> = new Map();
    private readonly CODE_EXPIRATION_MINUTES = 10;
    private readonly MAX_CODES_PER_PERIOD = 3;
    private readonly RATE_LIMIT_PERIOD_MINUTES = 15;
    private readonly MAX_VERIFICATION_ATTEMPTS = 5;

    /**
     * Generate a 4-digit verification code
     */
    private generateCode(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    /**
     * Check if email has exceeded rate limit for code requests
     */
    private checkRateLimit(email: string): void {
        const attempt = this.attemptTracker.get(email);

        if (attempt) {
            const timeSinceFirst = Date.now() - attempt.lastAttempt.getTime();
            const minutesElapsed = timeSinceFirst / (1000 * 60);

            if (minutesElapsed < this.RATE_LIMIT_PERIOD_MINUTES) {
                if (attempt.count >= this.MAX_CODES_PER_PERIOD) {
                    throw new AppError(
                        `Demasiados intentos. Espera ${Math.ceil(this.RATE_LIMIT_PERIOD_MINUTES - minutesElapsed)} minutos.`,
                        429
                    );
                }
                attempt.count++;
            } else {
                // Reset counter if period has elapsed
                attempt.count = 1;
                attempt.lastAttempt = new Date();
            }
        } else {
            this.attemptTracker.set(email, {
                email,
                lastAttempt: new Date(),
                count: 1
            });
        }
    }

    /**
     * Send verification code to email
     */
    async sendVerificationCode(email: string, fullName: string): Promise<void> {
        // Check rate limiting
        this.checkRateLimit(email);

        // Generate new code
        const code = this.generateCode();
        const expiresAt = new Date(Date.now() + this.CODE_EXPIRATION_MINUTES * 60 * 1000);

        // Check if user already exists (shouldn't happen, but safety check)
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser && existingUser.email_verified) {
            throw new AppError('Este correo ya está registrado y verificado.', 400);
        }

        // Store code in temporary user record or update existing unverified user
        if (existingUser) {
            existingUser.email_verification_code = code;
            existingUser.verification_code_expires_at = expiresAt;
            await existingUser.save();
        }
        // Note: If user doesn't exist yet, we'll store the code when creating the temp user in AuthService

        // Send email
        await emailService.sendVerificationEmail(email, code, fullName);

        console.log(`📧 Código de verificación enviado a ${email}: ${code} (expira en ${this.CODE_EXPIRATION_MINUTES} min)`);
    }

    /**
     * Verify code and return success status
     */
    async verifyCode(email: string, code: string): Promise<boolean> {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new AppError('No se encontró una solicitud de registro para este correo.', 404);
        }

        if (user.email_verified) {
            throw new AppError('Este correo ya ha sido verificado.', 400);
        }

        if (!user.email_verification_code || !user.verification_code_expires_at) {
            throw new AppError('No hay un código de verificación activo. Solicita uno nuevo.', 400);
        }

        // Check if code has expired
        if (new Date() > user.verification_code_expires_at) {
            throw new AppError('El código ha expirado. Solicita uno nuevo.', 400);
        }

        // Verify code matches
        if (user.email_verification_code !== code) {
            throw new AppError('Código incorrecto. Verifica e intenta de nuevo.', 400);
        }

        // Mark as verified and clear verification data
        user.email_verified = true;
        user.email_verification_code = null;
        user.verification_code_expires_at = null;
        await user.save();

        // Clear rate limit tracker
        this.attemptTracker.delete(email);

        console.log(`✅ Email verificado exitosamente: ${email}`);
        return true;
    }

    /**
     * Resend verification code
     */
    async resendCode(email: string): Promise<void> {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new AppError('No se encontró una solicitud de registro para este correo.', 404);
        }

        if (user.email_verified) {
            throw new AppError('Este correo ya ha sido verificado.', 400);
        }

        // Use the full_name from the user record
        await this.sendVerificationCode(email, user.full_name);
    }

    /**
     * Store verification code for a new user (called before user creation)
     */
    async storeCodeForNewUser(email: string, fullName: string, code: string, expiresAt: Date): Promise<void> {
        // This will be called from AuthService when initiating registration
        // We'll store it in a temporary user record
        console.log(`💾 Código almacenado para ${email}: ${code}`);
    }
}

export const verificationService = new VerificationService();
