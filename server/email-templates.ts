export interface ReminderEmailData {
  driverName: string;
  topRideOrigin?: string;
  topRideDestination?: string;
  contactCount: number;
  nearbyRideCount: number;
  homeTown?: string;
  isLongInactive: boolean;
  unsubscribeUrl: string;
  publishUrl: string;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildReminderEmailHtml(data: ReminderEmailData): string {
  const {
    driverName,
    topRideOrigin,
    topRideDestination,
    contactCount,
    nearbyRideCount,
    homeTown,
    isLongInactive,
    unsubscribeUrl,
    publishUrl,
  } = data;

  const safeName = escapeHtml(driverName);
  const greeting = isLongInactive
    ? `¡Te echamos de menos, ${safeName}!`
    : `¡Hola ${safeName}!`;

  const introText = isLongInactive
    ? 'Hace tiempo que no publicas un viaje en YaVoy. Tus vecinos podrían necesitar un asiento libre — ¿tienes algún viaje previsto esta semana?'
    : '¿Tienes algún viaje previsto esta semana? Comparte tu trayecto y ayuda a un vecino a llegar a donde necesita.';

  let contactSection = '';
  if (contactCount > 0 && topRideOrigin && topRideDestination) {
    const safeOrigin = escapeHtml(topRideOrigin);
    const safeDest = escapeHtml(topRideDestination);
    contactSection = `
      <tr>
        <td style="padding: 20px 30px;">
          <div style="background-color: #FFF8E7; border-left: 4px solid #f3b118; border-radius: 8px; padding: 16px 20px;">
            <p style="margin: 0; font-size: 16px; color: #2F2F2F;">
              📬 <strong>${contactCount} ${contactCount === 1 ? 'persona contactó' : 'personas contactaron'}</strong> por tu viaje
              <strong>${safeOrigin} → ${safeDest}</strong>.
              ¡Tu viaje les fue útil!
            </p>
          </div>
        </td>
      </tr>`;
  }

  let nearbySection = '';
  if (nearbyRideCount > 0 && homeTown) {
    const safeTown = escapeHtml(homeTown);
    nearbySection = `
      <tr>
        <td style="padding: 0 30px 20px;">
          <p style="margin: 0; font-size: 15px; color: #555;">
            🚗 Ahora mismo hay <strong>${nearbyRideCount} ${nearbyRideCount === 1 ? 'viaje publicado' : 'viajes publicados'}</strong> cerca de ${safeTown}.
            ¡Únete y haz crecer la comunidad!
          </p>
        </td>
      </tr>`;
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YaVoy - Publica tu viaje</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f0; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: #7dc891; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">YaVoy</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Compartir coche entre vecinos</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 10px;">
              <h2 style="margin: 0; font-size: 22px; color: #2F2F2F;">${greeting}</h2>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding: 10px 30px 20px;">
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #444;">${introText}</p>
            </td>
          </tr>

          <!-- Contact stats -->
          ${contactSection}

          <!-- Nearby rides -->
          ${nearbySection}

          <!-- Impact section -->
          <tr>
            <td style="padding: 10px 30px 20px;">
              <div style="background-color: #f0faf2; border-radius: 12px; padding: 20px;">
                <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #2F2F2F;">¿Por qué compartir viaje?</p>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 6px 0; font-size: 15px; color: #444;">🌱 Reduces emisiones de CO₂ y cuidas el medio ambiente</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 15px; color: #444;">🤝 Conectas con vecinos y fortaleces la comunidad rural</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 15px; color: #444;">💰 Compartes gastos de gasolina y peajes</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 15px; color: #444;">🚗 Ayudas a quien no tiene coche propio a llegar al médico, al mercado o a la ciudad</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 10px 30px 30px; text-align: center;">
              <a href="${publishUrl}" style="display: inline-block; background-color: #f3b118; color: #2F2F2F; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 18px; font-weight: 700; letter-spacing: -0.3px;">
                Publicar un viaje
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f6; padding: 20px 30px; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 13px; color: #999; text-align: center; line-height: 1.5;">
                Recibes este email porque tienes una cuenta en YaVoy.<br>
                <a href="${unsubscribeUrl}" style="color: #7dc891; text-decoration: underline;">Dejar de recibir estos emails</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildReminderEmailSubject(isLongInactive: boolean): string {
  return isLongInactive
    ? '¡Te echamos de menos! ¿Compartes viaje esta semana?'
    : '¿Tienes un viaje esta semana? Tus vecinos te necesitan 🚗';
}
