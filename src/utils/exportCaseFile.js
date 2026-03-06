/**
 * exportCaseFile.js
 * Generates a printable, timestamped repair history document.
 */
import { getStateTimelineForUrgency, inferStateCodeFromAddress, normalizeStateCode } from './stateRepairRules';

function fmtDate(iso) {
  if (!iso) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(new Date(iso));
}

function fmtShortDate(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(iso));
}

function daysSince(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function urgencyLabel(u) {
  return { low: 'Low', normal: 'Normal', high: 'High', emergency: 'EMERGENCY' }[u] || u;
}

function urgencyColor(u) {
  return { low: '#16a34a', normal: '#2563eb', high: '#d97706', emergency: '#dc2626' }[u] || '#374151';
}

function statusLabel(s) {
  return { pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved' }[s] || 'Pending';
}

export function exportCaseFile({ records, tenant, landlord }) {
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const tenantName = tenant?.tenantName || '[Tenant Name]';
  const tenantAddress = tenant?.tenantAddress || '[Property Address]';
  const tenantPhone = tenant?.tenantPhone || '';
  const tenantEmail = tenant?.tenantEmail || '';
  const landlordName = landlord?.landlordName || '[Landlord Name]';
  const landlordPhone = landlord?.landlordPhone || '';
  const stateCode = normalizeStateCode(tenant?.tenantState || inferStateCodeFromAddress(tenantAddress));
  const stateRule = getStateTimelineForUrgency(stateCode, 'normal');

  const totalRequests = sortedRecords.length;
  const unresolvedCount = sortedRecords.filter(r => (r.status || 'pending') !== 'resolved').length;
  const emergencyCount = sortedRecords.filter(r => r.urgency === 'emergency').length;
  const earliest = sortedRecords[0]?.timestamp;
  const latest = sortedRecords[sortedRecords.length - 1]?.timestamp;

  const entries = sortedRecords.map((r, i) => {
    const num = i + 1;
    const status = r.status || 'pending';
    const days = daysSince(r.timestamp);
    const responseNote = status === 'resolved'
      ? '<span class="resolved">✓ Resolved</span>'
      : `<span class="unresolved">⚠ Open — ${days} day${days === 1 ? '' : 's'} ago</span>`;

    const commLog = (r.communications || []).map(c =>
      `<tr><td>${(c.method || 'msg').toUpperCase()}</td><td>${fmtDate(c.timestamp)}</td></tr>`
    ).join('');

    const photoSection = r.photoDataUrl
      ? `<div class="entry-photo"><img src="${r.photoDataUrl}" alt="Photo from request #${num}" /></div>`
      : '';

    return `
      <div class="entry" id="entry-${num}">
        <div class="entry-header">
          <span class="entry-num">#${num}</span>
          <span class="urgency-badge" style="background:${urgencyColor(r.urgency)}">
            ${urgencyLabel(r.urgency)}
          </span>
          ${responseNote}
        </div>
        <table class="entry-meta">
          <tr><td>Date / Time</td><td><strong>${fmtDate(r.timestamp)}</strong></td></tr>
          <tr><td>Location</td><td>${r.location || '—'}</td></tr>
          <tr><td>Issue</td><td>${r.issue || '—'}</td></tr>
          <tr><td>Sent via</td><td>${r.method === 'sms' ? 'Text Message' : 'Email'}</td></tr>
          <tr><td>Status</td><td>${statusLabel(status)}</td></tr>
        </table>
        ${r.description ? `<div class="entry-desc"><p>${escHtml(r.description)}</p></div>` : ''}
        ${photoSection}
        ${commLog ? `<div class="comm-log"><strong>Messages sent:</strong>
          <table class="comm-table"><thead><tr><th>Method</th><th>Date</th></tr></thead>
          <tbody>${commLog}</tbody></table></div>` : ''}
      </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Repair Request — ${tenantName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 12pt; color: #111; background: #fff; line-height: 1.5; }
  .cover { padding: 3rem 2rem 2rem; border-bottom: 3px solid #111; margin-bottom: 2rem; }
  .cover h1 { font-size: 22pt; letter-spacing: -0.02em; margin-bottom: 0.25rem; }
  .cover .subtitle { font-size: 11pt; color: #555; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2rem; }
  .cover-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem; }
  .cover-box { border: 1px solid #ccc; padding: 1rem 1.25rem; border-radius: 4px; }
  .cover-box h3 { font-size: 9pt; text-transform: uppercase; letter-spacing: 0.08em; color: #666; margin-bottom: 0.5rem; }
  .stats { display: flex; gap: 2rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #ddd; }
  .stat { text-align: center; }
  .stat .num { font-size: 24pt; font-weight: bold; }
  .stat .lbl { font-size: 9pt; color: #555; text-transform: uppercase; letter-spacing: 0.05em; }
  .stat.emergency .num { color: #dc2626; }
  .stat.unresolved .num { color: #d97706; }
  .section { padding: 2rem; border-bottom: 1px solid #ddd; page-break-inside: avoid; }
  .section h2 { font-size: 14pt; margin-bottom: 1rem; border-bottom: 2px solid #111; padding-bottom: 0.4rem; }
  .toc { padding: 2rem; }
  .toc h2 { font-size: 14pt; margin-bottom: 0.75rem; }
  .toc ol { padding-left: 1.5rem; }
  .toc li { margin-bottom: 0.3rem; font-size: 10.5pt; }
  .entry { padding: 2rem; border-bottom: 1px solid #ddd; page-break-inside: avoid; }
  .entry-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .entry-num { font-size: 13pt; font-weight: bold; color: #555; }
  .urgency-badge { color: #fff; padding: 0.15rem 0.6rem; border-radius: 3px; font-size: 9pt; font-weight: bold; font-family: Arial, sans-serif; letter-spacing: 0.1em; }
  .resolved { color: #16a34a; font-size: 9.5pt; font-weight: bold; }
  .unresolved { color: #d97706; font-size: 9.5pt; font-weight: bold; }
  .entry-meta { width: 100%; border-collapse: collapse; font-size: 10.5pt; margin-bottom: 0.75rem; }
  .entry-meta td { padding: 0.3rem 0.5rem; border-bottom: 1px solid #eee; }
  .entry-meta td:first-child { width: 120px; color: #555; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.05em; }
  .entry-desc { background: #f9f9f9; border-left: 3px solid #999; padding: 0.75rem 1rem; margin: 0.75rem 0; font-size: 10.5pt; }
  .entry-desc p { margin-top: 0.25rem; }
  .entry-photo { margin: 0.75rem 0; }
  .entry-photo img { max-width: 400px; max-height: 300px; border: 1px solid #ccc; border-radius: 4px; }
  .comm-log { margin-top: 0.75rem; font-size: 10pt; }
  .comm-table { width: 100%; border-collapse: collapse; margin-top: 0.4rem; }
  .comm-table th, .comm-table td { padding: 0.25rem 0.5rem; border: 1px solid #ddd; text-align: left; }
  .comm-table th { background: #f0f0f0; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.05em; }
  .demand-letter { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.7; }
  .demand-letter ul { padding-left: 1.5rem; margin: 0.75rem 0; }
  .demand-letter li { margin-bottom: 0.25rem; }
  .letter-date { color: #555; margin-bottom: 1rem; }
  .footer { padding: 1rem 2rem; font-size: 9pt; color: #888; border-top: 1px solid #ddd; text-align: center; }
  @media print {
    body { font-size: 11pt; }
    .entry, .section { page-break-inside: avoid; }
    .cover { page-break-after: always; }
    .demand-letter { page-break-before: always; }
  }
</style>
</head>
<body>

<div class="cover">
  <div class="subtitle">Repair Request</div>
  <h1>${escHtml(tenantName)}</h1>
  <div class="cover-grid">
    <div class="cover-box">
      <h3>Tenant</h3>
      <p>${escHtml(tenantName)}</p>
      <p>${escHtml(tenantAddress)}</p>
      ${tenantPhone ? `<p>${escHtml(tenantPhone)}</p>` : ''}
      ${tenantEmail ? `<p>${escHtml(tenantEmail)}</p>` : ''}
    </div>
    <div class="cover-box">
      <h3>Landlord / Property Manager</h3>
      <p>${escHtml(landlordName)}</p>
      ${landlordPhone ? `<p>${escHtml(landlordPhone)}</p>` : ''}
    </div>
  </div>
  <div class="cover-grid" style="margin-top:1rem">
    <div class="cover-box">
      <h3>Period Covered</h3>
      <p>${fmtShortDate(earliest)} – ${fmtShortDate(latest)}</p>
    </div>
    <div class="cover-box">
      <h3>Generated</h3>
      <p>${fmtDate(new Date().toISOString())}</p>
      <p style="font-size:9pt;color:#888;margin-top:0.25rem">Created with fix it PLEASE — fixit.rent</p>
    </div>
  </div>
  <div class="stats">
    <div class="stat"><div class="num">${totalRequests}</div><div class="lbl">Total Requests</div></div>
    <div class="stat unresolved"><div class="num">${unresolvedCount}</div><div class="lbl">Unresolved</div></div>
    <div class="stat emergency"><div class="num">${emergencyCount}</div><div class="lbl">Emergency</div></div>
  </div>
</div>

<div class="toc">
  <h2>Contents</h2>
  <ol>
    <li><a href="#demand">Repair Summary</a></li>
    ${sortedRecords.map((r, i) => {
    const num = i + 1;
    return `<li><a href="#entry-${num}">#${num} — ${fmtShortDate(r.timestamp)}: ${escHtml(r.issue || 'Issue')}</a></li>`;
  }).join('')}
  </ol>
</div>

<div class="section demand-letter" id="demand">
  <h2>Repair Summary</h2>
  <p class="letter-date">${fmtShortDate(new Date().toISOString())}</p>
  <p><strong>${escHtml(landlordName)}</strong>${landlordPhone ? `<br>${escHtml(landlordPhone)}` : ''}</p>
  <br>
  <p>Dear ${escHtml(landlordName)},</p>
  <p>
    This is a direct summary of open repair issues
    at my residence, <strong>${escHtml(tenantAddress)}</strong>. As shown in the records below,
    I have submitted <strong>${totalRequests} maintenance request${totalRequests !== 1 ? 's' : ''}</strong>
    since ${fmtShortDate(earliest)}, of which <strong>${unresolvedCount} remain${unresolvedCount === 1 ? 's' : ''} unresolved</strong>.
    ${emergencyCount > 0 ? `<strong>${emergencyCount} ${emergencyCount !== 1 ? 'were' : 'was'} marked Emergency.</strong>` : ''}
  </p>
  <p>Please provide a repair plan with dates and access windows.</p>
  ${stateRule ? `<p><strong>State timeline reference (${escHtml(stateRule.name)}):</strong> ${escHtml(stateRule.deadline)}.</p>` : ''}
  <p>Requested actions:</p>
  <ul>
    <li>Confirm receipt of this record.</li>
    <li>Send start and completion dates for each open item.</li>
    <li>Coordinate entry access for repairs.</li>
  </ul>
  ${stateRule?.followUpDays?.length ? `<p>Please respond in writing within ${stateRule.followUpDays[0]} day${stateRule.followUpDays[0] === 1 ? '' : 's'}.</p>` : '<p>Please respond in writing as soon as possible.</p>'}
  <br>
  <p>Sincerely,</p>
  <p>
    <strong>${escHtml(tenantName)}</strong><br>
    ${escHtml(tenantAddress)}<br>
    ${tenantPhone ? escHtml(tenantPhone) + '<br>' : ''}
    ${tenantEmail ? escHtml(tenantEmail) : ''}
  </p>
</div>

${entries}

<div class="footer">
  This document was generated by fix it PLEASE (fixit.rent) on ${fmtDate(new Date().toISOString())}.<br>
  All records were created at the time of each maintenance request.
</div>

</body>
</html>`;

  // Trigger download
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `repair-request-${tenantName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
