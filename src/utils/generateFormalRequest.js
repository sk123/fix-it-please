/**
 * generateFormalRequest — creates a formal repair request letter
 * that a tenant can print, email, or share with their landlord.
 *
 * This is NOT a legal notice — it's a formal written request
 * that documents the tenant's communication in a professional format,
 * which is often required before exercising repair-and-deduct
 * or rent withholding rights.
 */

import { getStateRepairRule } from './stateRepairRules';

export function generateFormalRequest(record, settings, lang = 'en') {
    const today = new Date().toLocaleDateString(lang === 'es' ? 'es-US' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    const requestDate = record.timestamp
        ? new Date(record.timestamp).toLocaleDateString(lang === 'es' ? 'es-US' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
        })
        : today;

    const tenantName = settings.tenantName || (lang === 'es' ? '[Su Nombre]' : '[Your Name]');
    const tenantAddress = settings.tenantAddress || (lang === 'es' ? '[Su Dirección]' : '[Your Address]');
    const landlordName = settings.landlordName || (lang === 'es' ? '[Nombre del Casero]' : '[Landlord Name]');

    const issueList = (record.issues || [])
        .map(i => i.item || i.issue || i)
        .join(', ') || (lang === 'es' ? 'Problema no especificado' : 'Issue not specified');

    const location = (record.locations || []).join(', ') ||
        record.location ||
        (lang === 'es' ? 'No especificada' : 'Not specified');

    const urgency = record.urgency || 'normal';
    const urgencyLabels = {
        en: { low: 'Low', normal: 'Normal', high: 'High', emergency: 'Emergency' },
        es: { low: 'Baja', normal: 'Normal', high: 'Alta', emergency: 'Emergencia' },
    };

    const description = record.description || '';

    // State-specific timeline info
    const stateCode = settings.tenantState || '';
    const stateRule = stateCode ? getStateRepairRule(stateCode) : null;

    const isEn = lang !== 'es';

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEn ? 'Formal Repair Request' : 'Solicitud Formal de Reparación'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', 'Times New Roman', serif; color: #1a1a1a; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.65; font-size: 14px; }
    .header { text-align: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #2563eb; }
    .header h1 { font-size: 1.4rem; font-weight: 700; color: #2563eb; letter-spacing: 0.05em; text-transform: uppercase; }
    .header .subtitle { font-size: 0.85rem; color: #666; margin-top: 0.25rem; }
    .date-block { text-align: right; margin-bottom: 1.5rem; font-size: 0.9rem; color: #444; }
    .address-block { margin-bottom: 1.5rem; }
    .address-block p { margin-bottom: 0.15rem; }
    .salutation { margin-bottom: 1rem; }
    .body-text { margin-bottom: 1rem; text-align: justify; }
    .detail-box { background: #f7f7f7; border-left: 3px solid #2563eb; padding: 0.85rem 1rem; margin: 1rem 0; border-radius: 0 4px 4px 0; }
    .detail-box .label { font-weight: 700; font-size: 0.8rem; text-transform: uppercase; color: #2563eb; letter-spacing: 0.04em; }
    .detail-box .value { margin-top: 0.15rem; }
    .closing { margin-top: 2rem; }
    .signature { margin-top: 2.5rem; }
    .signature .line { border-top: 1px solid #333; width: 250px; margin-bottom: 0.35rem; }
    .footer { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #ddd; font-size: 0.75rem; color: #888; text-align: center; }
    @media print {
      body { padding: 1rem; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${isEn ? 'Formal Repair Request' : 'Solicitud Formal de Reparación'}</h1>
    <div class="subtitle">${isEn ? 'Written Notice of Needed Repairs' : 'Aviso Escrito de Reparaciones Necesarias'}</div>
  </div>

  <div class="date-block">
    <p>${isEn ? 'Date' : 'Fecha'}: ${today}</p>
  </div>

  <div class="address-block">
    <p><strong>${isEn ? 'To' : 'Para'}:</strong> ${landlordName}</p>
    <p><strong>${isEn ? 'From' : 'De'}:</strong> ${tenantName}</p>
    <p><strong>${isEn ? 'Property Address' : 'Dirección de la Propiedad'}:</strong> ${tenantAddress}</p>
  </div>

  <div class="salutation">
    <p>${isEn ? 'Dear' : 'Estimado/a'} ${landlordName},</p>
  </div>

  <div class="body-text">
    <p>${isEn
            ? `I am writing to formally request the repair of the following issue(s) at the above address. This serves as written documentation of my request, which was first submitted on <strong>${requestDate}</strong>.`
            : `Le escribo para solicitar formalmente la reparación del siguiente problema en la dirección mencionada. Este documento sirve como constancia escrita de mi solicitud, presentada inicialmente el <strong>${requestDate}</strong>.`
        }</p>
  </div>

  <div class="detail-box">
    <div class="label">${isEn ? 'Issue' : 'Problema'}</div>
    <div class="value">${issueList}</div>
  </div>

  <div class="detail-box">
    <div class="label">${isEn ? 'Location' : 'Ubicación'}</div>
    <div class="value">${location}</div>
  </div>

  <div class="detail-box">
    <div class="label">${isEn ? 'Urgency' : 'Urgencia'}</div>
    <div class="value">${(urgencyLabels[lang] || urgencyLabels.en)[urgency] || urgency}</div>
  </div>

  ${description ? `
  <div class="detail-box">
    <div class="label">${isEn ? 'Description' : 'Descripción'}</div>
    <div class="value">${description}</div>
  </div>
  ` : ''}

  <div class="body-text">
    <p>${isEn
            ? 'I respectfully ask that you address this issue as soon as possible to maintain the habitability and safety of the premises. Please contact me at your earliest convenience to schedule the necessary repairs.'
            : 'Le solicito respetuosamente que atienda este problema lo antes posible para mantener la habitabilidad y seguridad de la propiedad. Por favor comuníquese conmigo a la brevedad para programar las reparaciones necesarias.'
        }</p>
  </div>

  ${stateRule ? `
  <div class="body-text">
    <p><em>${isEn
                ? `Note: Under ${stateRule.name} law, landlords are generally required to respond to repair requests within a reasonable timeframe.`
                : `Nota: Bajo la ley de ${stateRule.name}, los caseros generalmente deben responder a solicitudes de reparación dentro de un plazo razonable.`
            }</em></p>
  </div>
  ` : ''}

  <div class="body-text">
    <p>${isEn
            ? 'Thank you for your prompt attention to this matter.'
            : 'Gracias por su pronta atención a este asunto.'
        }</p>
  </div>

  <div class="closing">
    <p>${isEn ? 'Sincerely,' : 'Atentamente,'}</p>
  </div>

  <div class="signature">
    <div class="line"></div>
    <p>${tenantName}</p>
    <p>${tenantAddress}</p>
    ${settings.tenantPhone ? `<p>${settings.tenantPhone}</p>` : ''}
    ${settings.tenantEmail ? `<p>${settings.tenantEmail}</p>` : ''}
  </div>

  <div class="footer">
    ${isEn
            ? 'Generated by fix it PLEASE — Renter\'s Toolbox'
            : 'Generado por fix it PLEASE — Caja de Herramientas del Inquilino'
        }
  </div>
</body>
</html>`;

    // Open in new window for printing/sharing
    const w = window.open('', '_blank');
    if (w) {
        w.document.write(html);
        w.document.close();
    }
}
