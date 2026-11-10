import nodemailer from 'nodemailer';

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

// Almacén en memoria de códigos OTP temporales
const otpStore = new Map<string, OtpEntry>();

// Duración del código: 10 minutos
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/**
 * Genera y almacena un código de 6 dígitos para un correo electrónico
 */
export function generateOtp(email: string): string {
  const normalized = email.trim().toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore.set(normalized, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0
  });

  return code;
}

/**
 * Valida el código OTP de 6 dígitos ingresado por el usuario
 */
export function verifyOtp(email: string, codeInput: string): { valid: boolean; error?: string } {
  const normalized = email.trim().toLowerCase();
  const entry = otpStore.get(normalized);

  if (!entry) {
    return { valid: false, error: 'No hay un código pendiente o ha expirado. Solicita un nuevo código.' };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalized);
    return { valid: false, error: 'El código de seguridad ha expirado. Solicita uno nuevo.' };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(normalized);
    return { valid: false, error: 'Has superado el límite de intentos fallidos. Solicita un nuevo código.' };
  }

  const cleanInput = String(codeInput).trim();
  if (entry.code !== cleanInput) {
    entry.attempts += 1;
    return {
      valid: false,
      error: `Código de verificación incorrecto. Intento ${entry.attempts} de ${MAX_ATTEMPTS}.`
    };
  }

  // Código correcto: se consume y se elimina para evitar reusabilidad
  otpStore.delete(normalized);
  return { valid: true };
}

export interface CustomSmtpConfig {
  user?: string;
  pass?: string;
}

/**
 * Envía el código de verificación por correo electrónico (Nodemailer / Gmail)
 * soportando el SMTP propio de cada SuperAdmin (o el SMTP principal como respaldo)
 * y además lo imprime con formato destacado en la terminal para pruebas inmediatas.
 */
export async function sendOtpEmail(
  email: string,
  code: string,
  recipientName = 'SuperAdmin',
  customSmtp?: CustomSmtpConfig
): Promise<{ sentViaSmtp: boolean; error?: string }> {
  const primaryUser = (process.env.SMTP_USER || 'nicolasnieto191213@gmail.com').trim();
  const primaryPass = (process.env.SMTP_PASS || '').trim();

  // Si la cuenta tiene su propio SMTP_2_USER y SMTP_2_PASS configurados, los usa;
  // de lo contrario, usa automáticamente el SMTP principal para que el correo llegue igual.
  const hasCustomSmtp =
    Boolean(customSmtp?.user && customSmtp.user.trim() && customSmtp.user.trim() !== 'correo_de_tu_amigo@gmail.com') &&
    Boolean(customSmtp?.pass && customSmtp.pass.trim());

  const activeSmtpUser = hasCustomSmtp ? customSmtp!.user!.trim() : primaryUser;
  const activeSmtpPass = hasCustomSmtp ? customSmtp!.pass!.trim() : primaryPass;

  // 1. Siempre mostramos el código en la consola del servidor con alto impacto visual
  console.log('\n' + '═'.repeat(68));
  console.log(` 🔐 [UEFA ARCHIVE 2FA] CÓDIGO DE VERIFICACIÓN SUPERADMIN (${recipientName})`);
  console.log(` 📧 Destinatario : ${email}`);
  console.log(` 📤 Remitente    : ${activeSmtpUser}`);
  console.log(` 🔑 CÓDIGO OTP   : [ ${code.split('').join(' ')} ]`);
  console.log(` ⏱️  Validez      : 10 minutos`);
  if (!activeSmtpPass) {
    console.log(' ℹ️  Nota SMTP    : Para entrega directa en bandeja Gmail, añade tu');
    console.log('                   Contraseña de Aplicación de Google a SMTP_PASS o SMTP_2_PASS en .env');
  }
  console.log('═'.repeat(68) + '\n');

  // 2. Si no hay contraseña de aplicación configurada en .env, avisamos que quedó en consola
  if (!activeSmtpPass) {
    return { sentViaSmtp: false };
  }

  const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #060b17; color: #ffffff; padding: 40px 20px; border-radius: 12px; max-width: 540px; margin: 0 auto; border: 1px solid #1a2a47;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #00d2ff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">
            🏆 UEFA CHAMPIONS LEAGUE ARCHIVE
          </h1>
          <p style="color: #8da2c0; font-size: 14px; margin: 8px 0 0 0;">
            Autenticación de Doble Factor — Acceso SuperAdmin
          </p>
        </div>

        <div style="background: rgba(14, 27, 49, 0.95); border-radius: 10px; padding: 24px; border: 1px solid #203a66; text-align: center;">
          <p style="color: #e2e8f0; font-size: 15px; margin-top: 0;">
            Hola <strong>${recipientName}</strong> (<code>${email}</code>), se ha solicitado un inicio de sesión de SuperAdmin con tus credenciales maestras.
          </p>
          <p style="color: #94a3b8; font-size: 13px;">
            Ingresa el siguiente código de seguridad en el panel para desbloquear el sistema:
          </p>

          <div style="background: #020814; border: 2px dashed #00d2ff; border-radius: 8px; padding: 16px; margin: 24px 0; display: inline-block;">
            <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #ffd700;">
              ${code}
            </span>
          </div>

          <p style="color: #f59e0b; font-size: 12px; margin-bottom: 0;">
            ⏱️ Este código es de un solo uso y expirará en <strong>10 minutos</strong>.
          </p>
        </div>

        <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #64748b;">
          Si tú no solicitaste este código, te recomendamos revisar tus credenciales de inmediato.
        </div>
      </div>
    `;

  // 3. Puente HTTPS de Google Apps Script (Puerto 443 - Ideal para Render Free Tier que bloquea puertos SMTP 465/587)
  const defaultScriptUrl =
    'https://script.google.com/macros/s/AKfycbwq_VkPNrv7dsM_oNr27OFuDoPbdLdaIDux4asiVSR94oCRfHvX4X2BtUnME_UsVz8S/exec';
  const googleScriptUrl = (process.env.GOOGLE_SCRIPT_URL || defaultScriptUrl)
    .replace(/^["']+|["']+$/g, '')
    .trim();

  if (googleScriptUrl.startsWith('https://')) {
    try {
      const response = await fetch(googleScriptUrl, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          to: email,
          subject: `🔐 Tu Código de Seguridad SuperAdmin: ${code}`,
          htmlBody: htmlContent
        })
      });
      const resText = await response.text();
      if (response.ok && (resText.includes('"ok"') || !resText.includes('<!DOCTYPE html>'))) {
        console.log(`✅ [Google Apps Script HTTPS] Correo 2FA entregado exitosamente a ${email}`);
        return { sentViaSmtp: true };
      } else {
        console.warn(
          `⚠️ [Google Script Status ${response.status}] Verifica en script.google.com que "Quién tiene acceso" esté en "Cualquier persona" (la última opción) y no en "Solo yo" ni "Cualquier usuario con cuenta de Google".`
        );
      }
    } catch (webhookErr: any) {
      console.error('Error en Google Script Webhook HTTPS:', webhookErr.message);
    }
  }

  // En Render Free Tier los puertos SMTP 25/465/587 están bloqueados por firewall; evitamos esperar timeout TCP
  if (process.env.RENDER || process.env.RENDER_EXTERNAL_URL) {
    return { sentViaSmtp: false };
  }

  // 4. En entorno local (PC), enviamos el correo por SMTP (puerto 465)
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: activeSmtpUser,
        pass: activeSmtpPass.replace(/\s+/g, '')
      },
      connectionTimeout: 7000,
      greetingTimeout: 7000,
      socketTimeout: 10000
    });

    await transporter.sendMail({
      from: `"UEFA Champions League Archive" <${activeSmtpUser}>`,
      to: email,
      subject: `🔐 Tu Código de Seguridad SuperAdmin: ${code}`,
      html: htmlContent
    });

    return { sentViaSmtp: true };
  } catch (err: any) {
    // Si falló el SMTP_2 personalizado pero tenemos el SMTP_1 principal configurado, respaldamos el envío
    if (hasCustomSmtp && primaryPass && activeSmtpUser !== primaryUser) {
      try {
        const fallbackTransporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: primaryUser,
            pass: primaryPass.replace(/\s+/g, '')
          },
          connectionTimeout: 7000,
          greetingTimeout: 7000,
          socketTimeout: 10000
        });
        await fallbackTransporter.sendMail({
          from: `"UEFA Champions League Archive" <${primaryUser}>`,
          to: email,
          subject: `🔐 Tu Código de Seguridad SuperAdmin: ${code}`,
          html: htmlContent
        });
        return { sentViaSmtp: true };
      } catch (fallbackErr: any) {
        console.error('Error al enviar correo por Gmail SMTP de respaldo:', fallbackErr.message);
        return { sentViaSmtp: false, error: fallbackErr.message };
      }
    }

    console.error('Error al enviar correo por Gmail SMTP:', err.message);
    return { sentViaSmtp: false, error: err.message };
  }
}

