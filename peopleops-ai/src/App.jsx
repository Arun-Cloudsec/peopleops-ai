import { useState, useRef, useEffect, useCallback } from 'react';
import mammoth from 'mammoth';
import PptxGenJS from 'pptxgenjs';
import { PRACTICE_AREAS, MANAGED_AGENTS, CONNECTORS } from './data/practiceAreas.js';
import { SAMPLE_DOCS, VULN_REPORT } from './data/documents.js';
import { SAMPLE_CONTRACT_REGISTER, SAMPLE_REG_UPDATES, SAMPLE_LAUNCH_ITEMS } from './data/agentData.js';
import { COMPARE_PAIRS } from './data/comparePairs.js';
import './App.css';

const totalSkills = PRACTICE_AREAS.reduce((a, p) => a + p.skills.length, 0);

/* ─── API HELPER ─── */
async function chatAPI({ messages, system }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data.content?.map(c => c.text || '').join('\n') || 'No response content.';
}

/* ─── EXPORT HELPERS ─── */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ─── REPORT PARSER & RENDERER ─── */
function parseReport(text) {
  const items = [];
  // Match finding blocks: emoji + F-NNN | SEVERITY | Section — Title
  const findingRegex = /(🔴|🟡|🟢|💡|📋)\s*F-(\d+)\s*\|\s*(HIGH RISK|MEDIUM RISK|LOW RISK|RECOMMENDATION|FINDING)\s*\|\s*([^\n]+)/g;
  let match;
  const positions = [];

  while ((match = findingRegex.exec(text)) !== null) {
    positions.push({ idx: match.index, emoji: match[1], num: match[2], severity: match[3], header: match[4] });
  }

  // Fallback to old format if new format not found
  if (positions.length === 0) {
    const lines = text.split('\n');
    let currentItem = null;
    for (const line of lines) {
      const t = line.trim();
      const oldMatch = t.match(/^(🔴|🟡|🟢|💡|📋)\s*(?:HIGH RISK|MEDIUM RISK|LOW RISK|RECOMMENDATION|FINDING|F-\d+[^:]*):?\s*(.*)/);
      if (oldMatch) {
        if (currentItem) items.push(currentItem);
        const typeMap = { '🔴': 'high', '🟡': 'medium', '🟢': 'low', '💡': 'rec', '📋': 'finding' };
        currentItem = { type: typeMap[oldMatch[1]] || 'finding', num: '', title: oldMatch[2].split('—')[0]?.trim(), body: oldMatch[2], reference: '', issue: '', currentWording: '', recommendedWording: '' };
      } else if (currentItem && t) {
        currentItem.body += ' ' + t;
      }
    }
    if (currentItem) items.push(currentItem);
    return items;
  }

  for (let p = 0; p < positions.length; p++) {
    const pos = positions[p];
    const endIdx = p < positions.length - 1 ? positions[p + 1].idx : text.length;
    const block = text.substring(pos.idx, endIdx);
    const typeMap = { '🔴': 'high', '🟡': 'medium', '🟢': 'low', '💡': 'rec', '📋': 'finding' };

    const sectionTitle = pos.header.split('—');
    const section = sectionTitle[0]?.trim() || '';
    const title = sectionTitle.slice(1).join('—').trim() || section;

    const getField = (label) => {
      const rx = new RegExp(label + ':\\s*(.+?)(?=\\n(?:REFERENCE|ISSUE|CURRENT WORDING|RECOMMENDED WORDING|🔴|🟡|🟢|💡|📋|##|---|$))', 's');
      const m = block.match(rx);
      return m ? m[1].trim().replace(/^[""]|[""]$/g, '') : '';
    };

    items.push({
      type: typeMap[pos.emoji] || 'finding',
      num: 'F-' + pos.num,
      title,
      section,
      reference: getField('REFERENCE'),
      issue: getField('ISSUE'),
      currentWording: getField('CURRENT WORDING'),
      recommendedWording: getField('RECOMMENDED WORDING'),
      body: getField('ISSUE') || block.split('\n').slice(1).map(l => l.trim()).filter(l => l && !l.match(/^(REFERENCE|ISSUE|CURRENT WORDING|RECOMMENDED WORDING):/)).join(' '),
    });
  }
  return items;
}

function parseKeyActions(text) {
  const section = extractSection(text, 'KEY ACTIONS');
  if (!section) return [];
  const lines = section.split('\n').filter(l => l.trim().match(/^KA-\d+/));
  return lines.map(l => {
    const parts = l.split('|').map(p => p.trim());
    return { num: parts[0] || '', severity: parts[1] || '', reference: parts[2] || '', issue: parts[3] || '', recommendation: parts[4] || '' };
  });
}

function isReport(text) {
  // Check for new structured format
  if (/F-\d+\s*\|\s*(HIGH|MEDIUM|LOW)\s*RISK/i.test(text)) return true;
  // Fallback to old markers
  const markers = ['🔴', '🟡', '🟢', '💡', '📋'];
  let count = 0;
  for (const m of markers) { if (text.includes(m)) count++; }
  return count >= 2;
}

function extractSection(text, heading) {
  const regex = new RegExp('##\\s*' + heading + '\\s*\\n([\\s\\S]*?)(?=\\n##|---\\n|$)', 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

function exportReport(text, format) {
  const ts = new Date().toISOString().split('T')[0];
  const title = (text.match(/##\s*REPORT:\s*(.+)/i) || [,'People Analysis Report'])[1].trim();
  const items = parseReport(text);
  const summary = extractSection(text, 'RISK SUMMARY');
  const actions = extractSection(text, 'KEY ACTIONS');
  const fname = title.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 60);
  const sevColors = { high: '#DC2626', medium: '#D97706', low: '#059669', rec: '#2563EB', finding: '#6B7280' };
  const sevLabels = { high: 'HIGH RISK', medium: 'MEDIUM RISK', low: 'LOW RISK', rec: 'RECOMMENDATION', finding: 'FINDING' };
  const counts = { high: items.filter(i => i.type === 'high').length, medium: items.filter(i => i.type === 'medium').length, low: items.filter(i => i.type === 'low').length, rec: items.filter(i => i.type === 'rec').length, finding: items.filter(i => i.type === 'finding').length };
  const totalFindings = items.length;

  // ═══ PDF / VIEW — opens in new tab with title page + dashboard + details ═══
  if (format === 'pdf' || format === 'view') {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
@media print { .no-print{display:none} .page-break{page-break-before:always} body{-webkit-print-color-adjust:exact;print-color-adjust:exact} }
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Calibri,'Segoe UI',sans-serif;color:#1B2A4A;line-height:1.5}

/* Title Page */
.title-page{height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;background:linear-gradient(160deg,#0B0E18 0%,#16213e 50%,#1B2A4A 100%);color:white;text-align:center;padding:60px}
.title-page h1{font-size:36px;font-weight:300;letter-spacing:2px;margin-bottom:8px;color:#C9A84C}
.title-page h2{font-size:28px;font-weight:700;margin:16px 0;max-width:700px}
.title-page .meta-row{display:flex;gap:32px;margin-top:28px;font-size:14px;color:#94a3b8}
.title-page .meta-row span{display:flex;align-items:center;gap:6px}
.title-page .classification{margin-top:40px;padding:8px 28px;border:2px solid #C9A84C;color:#C9A84C;font-weight:700;letter-spacing:2px;font-size:13px;border-radius:4px}
.title-page .org{font-size:14px;color:#64748b;margin-top:auto;padding-top:40px;border-top:1px solid rgba(255,255,255,0.1);width:100%}

/* Dashboard Page */
.dashboard{padding:48px;max-width:900px;margin:0 auto}
.dashboard h2{font-size:22px;color:#1B2A4A;border-bottom:3px solid #C9A84C;padding-bottom:10px;margin-bottom:24px}
.dash-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
.dash-card{padding:20px;border-radius:10px;text-align:center;border:1px solid #e2e8f0}
.dash-card .num{font-size:36px;font-weight:700}
.dash-card .lbl{font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-top:4px}
.dash-card-high{background:#FEF2F2;border-color:#FECACA}.dash-card-high .num{color:#DC2626}
.dash-card-medium{background:#FFFBEB;border-color:#FDE68A}.dash-card-medium .num{color:#D97706}
.dash-card-low{background:#ECFDF5;border-color:#A7F3D0}.dash-card-low .num{color:#059669}
.dash-card-rec{background:#EFF6FF;border-color:#BFDBFE}.dash-card-rec .num{color:#2563EB}
.bar-chart{margin-bottom:32px}
.bar-row{display:flex;align-items:center;gap:12px;margin-bottom:8px}
.bar-label{width:120px;font-size:13px;font-weight:600;text-align:right}
.bar-track{flex:1;height:28px;background:#f1f5f9;border-radius:6px;overflow:hidden}
.bar-fill{height:100%;border-radius:6px;display:flex;align-items:center;padding-left:10px;font-size:12px;font-weight:700;color:white;min-width:fit-content}
.summary-box{background:#F8F6F0;padding:20px;border-radius:10px;border:1px solid #E5E1D8;font-size:14px;line-height:1.7;margin-bottom:20px}
.actions-box{background:#EFF6FF;padding:20px;border-radius:10px;border:1px solid #BFDBFE;font-size:14px;line-height:1.7}
.ka-table{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px}
.ka-table th{background:#1B2A4A;color:white;padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.8px}
.ka-table td{padding:10px 12px;border-bottom:1px solid #e2e8f0;vertical-align:top}
.ka-table tr.ka-high{border-left:4px solid #DC2626}
.ka-table tr.ka-med{border-left:4px solid #D97706}
.ka-table tr.ka-low{border-left:4px solid #059669}
.sev-pill{display:inline-block;padding:2px 10px;border-radius:8px;font-size:10px;font-weight:700;color:white}
.sev-high{background:#DC2626}.sev-med{background:#D97706}.sev-low{background:#059669}

/* Findings Pages */
.findings{padding:48px;max-width:900px;margin:0 auto}
.findings h2{font-size:22px;color:#1B2A4A;border-bottom:3px solid #C9A84C;padding-bottom:10px;margin-bottom:20px}
.item{padding:16px 20px;margin:12px 0;border-radius:10px;border-left:5px solid;page-break-inside:avoid}
.item-high{border-color:#DC2626;background:#FEF2F2}
.item-medium{border-color:#D97706;background:#FFFBEB}
.item-low{border-color:#059669;background:#ECFDF5}
.item-rec{border-color:#2563EB;background:#EFF6FF}
.item-finding{border-color:#6B7280;background:#F9FAFB}
.badge{display:inline-block;padding:3px 12px;border-radius:10px;font-size:10px;font-weight:700;color:white;letter-spacing:1px;text-transform:uppercase}
.item h3{font-size:15px;margin:8px 0 6px;color:#1B2A4A}
.item p{font-size:13px;color:#334155;line-height:1.65}
.footer{text-align:center;font-size:11px;color:#94a3b8;padding:24px;border-top:2px solid #C9A84C;margin-top:40px}
.print-bar{background:#1B2A4A;color:white;padding:12px 24px;display:flex;gap:12px;align-items:center}
.print-bar button{background:#C9A84C;color:#1B2A4A;border:none;padding:8px 20px;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px}
</style></head><body>
<div class="print-bar no-print"><span style="font-weight:700">⚖ PeopleOps AI Report</span><button onclick="window.print()">🖨️ Print / Save as PDF</button><span style="color:#94a3b8;font-size:13px;margin-left:auto">Ctrl+P → Save as PDF for best results</span></div>

<!-- PAGE 1: TITLE -->
<div class="title-page">
<h1>⚖ PEOPLEOPS AI</h1>
<div style="font-size:13px;letter-spacing:3px;color:#64748b;margin-bottom:40px">LEGAL INTELLIGENCE PLATFORM</div>
<h2>${title}</h2>
<div class="meta-row">
<span>📅 ${ts}</span>
<span>📊 ${totalFindings} Findings</span>
<span>🔴 ${counts.high} High Risk</span>
<span>🟡 ${counts.medium} Medium Risk</span>
</div>
<div class="classification">CONFIDENTIAL — ATTORNEY WORK PRODUCT</div>
<div class="org">PeopleOps AI — HR Intelligence Platform | Draft for Attorney Review</div>
</div>

<!-- PAGE 2: DASHBOARD -->
<div class="page-break"></div>
<div class="dashboard">
<h2>Executive Dashboard</h2>
<div class="dash-grid">
<div class="dash-card dash-card-high"><div class="num">${counts.high}</div><div class="lbl">High Risk</div></div>
<div class="dash-card dash-card-medium"><div class="num">${counts.medium}</div><div class="lbl">Medium Risk</div></div>
<div class="dash-card dash-card-low"><div class="num">${counts.low}</div><div class="lbl">Low Risk</div></div>
<div class="dash-card dash-card-rec"><div class="num">${counts.rec}</div><div class="lbl">Recommendations</div></div>
</div>
<h3 style="font-size:16px;color:#1B2A4A;margin-bottom:12px">Risk Distribution</h3>
<div class="bar-chart">
${counts.high > 0 ? `<div class="bar-row"><div class="bar-label">High Risk</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(counts.high/totalFindings*100,15)}%;background:#DC2626">${counts.high}</div></div></div>` : ''}
${counts.medium > 0 ? `<div class="bar-row"><div class="bar-label">Medium Risk</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(counts.medium/totalFindings*100,15)}%;background:#D97706">${counts.medium}</div></div></div>` : ''}
${counts.low > 0 ? `<div class="bar-row"><div class="bar-label">Low Risk</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(counts.low/totalFindings*100,15)}%;background:#059669">${counts.low}</div></div></div>` : ''}
${counts.rec > 0 ? `<div class="bar-row"><div class="bar-label">Recommendations</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(counts.rec/totalFindings*100,15)}%;background:#2563EB">${counts.rec}</div></div></div>` : ''}
</div>
${summary ? `<h3 style="font-size:16px;color:#1B2A4A;margin-bottom:8px">Risk Summary</h3><div class="summary-box">${summary}</div>` : ''}
${(() => { const kas = parseKeyActions(text); return kas.length > 0 ? `<h3 style="font-size:16px;color:#1B2A4A;margin:16px 0 8px">Key Actions Required</h3>
<table class="ka-table"><tr><th>Action #</th><th>Risk</th><th>Reference</th><th>Details</th><th>Recommendation</th></tr>
${kas.map(ka => `<tr class="ka-${ka.severity.toLowerCase().includes('high') ? 'high' : ka.severity.toLowerCase().includes('medium') ? 'med' : 'low'}"><td style="font-weight:700;color:#C9A84C;font-family:monospace">${ka.num}</td><td><span class="sev-pill sev-${ka.severity.toLowerCase().includes('high') ? 'high' : ka.severity.toLowerCase().includes('medium') ? 'med' : 'low'}">${ka.severity}</span></td><td style="color:#5B9BD5">${ka.reference}</td><td>${ka.issue}</td><td style="font-weight:500">${ka.recommendation}</td></tr>`).join('')}
</table>` : ''; })()}
</div>

<!-- PAGE 3+: DETAILED FINDINGS -->
<div class="page-break"></div>
<div class="findings">
<h2>Detailed Findings (${totalFindings})</h2>
${items.map((item, idx) => `<div class="item item-${item.type}"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span class="badge" style="background:${sevColors[item.type]}">${sevLabels[item.type]}</span><span style="font-size:12px;color:#C9A84C;font-weight:700;font-family:monospace">${item.num || 'F-' + String(idx+1).padStart(3,'0')}</span></div><h3>${item.title}</h3>${item.reference ? '<p style="font-size:12px;color:#5B9BD5;margin:2px 0">📌 ' + item.section + (item.reference ? ' — ' + item.reference : '') + '</p>' : ''}${item.issue ? '<p style="margin:6px 0"><strong>Issue:</strong> ' + item.issue + '</p>' : (item.body ? '<p>' + item.body + '</p>' : '')}${item.currentWording ? '<div style="background:#FEF2F2;padding:8px 12px;border-radius:6px;border-left:3px solid #DC2626;margin:6px 0;font-size:13px"><strong style="color:#DC2626">⛔ Current Wording:</strong> <em>"' + item.currentWording + '"</em></div>' : ''}${item.recommendedWording ? '<div style="background:#ECFDF5;padding:8px 12px;border-radius:6px;border-left:3px solid #059669;margin:6px 0;font-size:13px"><strong style="color:#059669">✅ Recommended Wording:</strong> <em>"' + item.recommendedWording + '"</em></div>' : ''}</div>`).join('')}
</div>
<div class="footer">CONFIDENTIAL — Draft for HR leadership review — not HR advice<br>PeopleOps AI — HR Intelligence Platform | Generated ${ts}</div>
</body></html>`;
    // Reliable: write to new window
    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      // Only trigger print for 'pdf' format, not 'view'
      if (format === 'pdf') {
        printWin.onload = function() { setTimeout(function() { printWin.focus(); printWin.print(); }, 400); };
        setTimeout(function() { try { printWin.focus(); printWin.print(); } catch(e) {} }, 1500);
      }
    } else {
      downloadBlob(new Blob([html], { type: 'text/html' }), fname + '-' + ts + '.html');
    }
  }

  // ═══ WORD — .doc HTML that opens natively in Word ═══
  if (format === 'word') {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><meta name="ProgId" content="Word.Document">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
body{font-family:Calibri,sans-serif;color:#1B2A4A;margin:40px}
h1{font-size:28px;color:#1B2A4A;border-bottom:3px solid #C9A84C;padding-bottom:10px}
h2{font-size:20px;color:#1B2A4A;margin-top:24px;border-bottom:2px solid #E5E1D8;padding-bottom:6px}
table{border-collapse:collapse;width:100%;margin:16px 0}
td,th{border:1px solid #ddd;padding:10px 14px;font-size:13px}
th{background:#1B2A4A;color:white;font-weight:700;text-align:left}
.high{background:#FEF2F2;border-left:4px solid #DC2626}
.medium{background:#FFFBEB;border-left:4px solid #D97706}
.low{background:#ECFDF5;border-left:4px solid #059669}
.rec{background:#EFF6FF;border-left:4px solid #2563EB}
.finding{background:#F9FAFB;border-left:4px solid #6B7280}
.badge{display:inline-block;padding:2px 10px;border-radius:8px;font-size:10px;font-weight:700;color:white}
.dash-table td{text-align:center;font-size:28px;font-weight:700;padding:20px}
.dash-label{font-size:11px;color:#64748b;font-weight:400}
</style></head><body>
<div style="text-align:center;margin:60px 0 40px">
<h1 style="border:none;font-size:32px;margin-bottom:4px">⚖ PEOPLEOPS AI</h1>
<p style="letter-spacing:3px;color:#64748b;font-size:12px;margin-bottom:24px">LEGAL INTELLIGENCE PLATFORM</p>
<h2 style="border:none;font-size:24px">${title}</h2>
<p style="color:#64748b;font-size:14px;margin-top:12px">${ts} | CONFIDENTIAL — Attorney Work Product</p>
</div>
<br style="page-break-before:always">
<h2>Executive Dashboard</h2>
<table class="dash-table">
<tr><td style="color:#DC2626">${counts.high}<br><span class="dash-label">High Risk</span></td>
<td style="color:#D97706">${counts.medium}<br><span class="dash-label">Medium Risk</span></td>
<td style="color:#059669">${counts.low}<br><span class="dash-label">Low Risk</span></td>
<td style="color:#2563EB">${counts.rec}<br><span class="dash-label">Recommendations</span></td></tr>
</table>
${summary ? `<h3>Risk Summary</h3><p style="background:#F8F6F0;padding:16px;border-radius:6px;border:1px solid #E5E1D8">${summary}</p>` : ''}
${(() => { const kas = parseKeyActions(text); return kas.length > 0 ? `<h3>Key Actions Required</h3><table><tr><th>Action #</th><th>Risk</th><th>Reference</th><th>Details</th><th>Recommendation</th></tr>${kas.map(ka => '<tr><td style="font-weight:700;color:#C9A84C">' + ka.num + '</td><td><span class="badge" style="background:' + (ka.severity.toLowerCase().includes('high') ? '#DC2626' : ka.severity.toLowerCase().includes('medium') ? '#D97706' : '#059669') + '">' + ka.severity + '</span></td><td style="color:#5B9BD5">' + ka.reference + '</td><td>' + ka.issue + '</td><td>' + ka.recommendation + '</td></tr>').join('')}</table>` : (actions ? '<h3>Key Actions</h3><p style="background:#EFF6FF;padding:16px;border-radius:6px">' + actions.replace(/\n/g, '<br>') + '</p>' : ''); })()}
<br style="page-break-before:always">
<h2>Detailed Findings (${totalFindings})</h2>
<table>
<tr><th style="width:60px">#</th><th style="width:90px">Severity</th><th style="width:160px">Finding</th><th style="width:160px">Reference</th><th>Issue & Recommendation</th></tr>
${items.map((item, idx) => `<tr class="${item.type}"><td style="font-weight:700;color:#C9A84C;font-family:monospace">${item.num || 'F-' + String(idx+1).padStart(3,'0')}</td><td><span class="badge" style="background:${sevColors[item.type]}">${sevLabels[item.type]}</span></td><td style="font-weight:700">${item.title}</td><td style="font-size:12px;color:#5B9BD5">${item.section || ''}${item.reference ? '<br>' + item.reference : ''}</td><td>${item.issue || item.body}${item.currentWording ? '<br><br><strong style="color:#DC2626">⛔ Current:</strong> <em>' + item.currentWording + '</em>' : ''}${item.recommendedWording ? '<br><strong style="color:#059669">✅ Recommended:</strong> <em>' + item.recommendedWording + '</em>' : ''}</td></tr>`).join('')}
</table>
<hr style="border:none;border-top:2px solid #C9A84C;margin-top:40px">
<p style="text-align:center;font-size:11px;color:#94a3b8">Draft for HR leadership review — not HR advice | PeopleOps AI | ${ts}</p>
</body></html>`;
    downloadBlob(new Blob([html], { type: 'application/msword' }), `${fname}-${ts}.doc`);
  }

  // ═══ EXCEL — CSV with structured data ═══
  if (format === 'csv') {
    const sevMap = { high: 'HIGH', medium: 'MEDIUM', low: 'LOW', rec: 'RECOMMENDATION', finding: 'INFO' };
    const rows = ['"Finding #","Severity","Priority","Title","Section Reference","Issue","Current Wording","Recommended Wording","Status","Assigned To","Due Date","Report Date"'];
    items.forEach((item, i) => {
      const priority = item.type === 'high' ? '1-Critical' : item.type === 'medium' ? '2-High' : item.type === 'low' ? '3-Medium' : '4-Low';
      rows.push(`"${item.num || 'F-' + String(i+1).padStart(3,'0')}","${sevMap[item.type]}","${priority}","${item.title.replace(/"/g, '""')}","${(item.section || '').replace(/"/g, '""')}","${(item.issue || item.body).replace(/"/g, '""')}","${(item.currentWording || '').replace(/"/g, '""')}","${(item.recommendedWording || '').replace(/"/g, '""')}","Open","","","${ts}"`);
    });
    if (summary) rows.push(`"","SUMMARY","","Risk Summary","${summary.replace(/"/g, '""')}","","","","${ts}"`);
    if (actions) rows.push(`"","ACTIONS","","Key Actions","${actions.replace(/"/g, '""').replace(/\n/g, ' ')}","","","","${ts}"`);
    downloadBlob(new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' }), `${fname}-${ts}.csv`);
  }

  // ═══ POWERPOINT — professional slide deck ═══
  if (format === 'pptx') {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'PeopleOps AI';
    pptx.subject = title;
    const NAVY = '1B2A4A';
    const GOLD = 'C9A84C';

    // Slide 1: Title
    const s1 = pptx.addSlide();
    s1.background = { fill: NAVY };
    s1.addText('⚖  PEOPLEOPS AI', { x: 0, y: 0.6, w: '100%', h: 0.6, fontSize: 18, color: GOLD, align: 'center', fontFace: 'Calibri', letterSpacing: 4 });
    s1.addText('LEGAL INTELLIGENCE PLATFORM', { x: 0, y: 1.1, w: '100%', h: 0.4, fontSize: 11, color: '94a3b8', align: 'center', fontFace: 'Calibri', letterSpacing: 5 });
    s1.addShape(pptx.ShapeType.rect, { x: 3, y: 1.8, w: 7.33, h: 0.04, fill: { color: GOLD } });
    s1.addText(title, { x: 1, y: 2.2, w: 11.33, h: 1.2, fontSize: 28, color: 'FFFFFF', align: 'center', fontFace: 'Calibri', bold: true });
    s1.addText(`${ts}  |  ${totalFindings} Findings  |  ${counts.high} High Risk  |  ${counts.medium} Medium Risk`, { x: 0, y: 3.6, w: '100%', h: 0.4, fontSize: 12, color: '94a3b8', align: 'center', fontFace: 'Calibri' });
    s1.addText('CONFIDENTIAL — ATTORNEY WORK PRODUCT', { x: 0, y: 4.4, w: '100%', h: 0.4, fontSize: 11, color: GOLD, align: 'center', fontFace: 'Calibri', bold: true });
    s1.addText('Draft for Attorney Review — Not Legal Advice', { x: 0, y: 6.6, w: '100%', h: 0.3, fontSize: 10, color: '64748b', align: 'center', fontFace: 'Calibri', italic: true });

    // Slide 2: Dashboard
    const s2 = pptx.addSlide();
    s2.addText('Executive Dashboard', { x: 0.5, y: 0.3, w: 8, h: 0.5, fontSize: 22, color: NAVY, bold: true, fontFace: 'Calibri' });
    s2.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.8, w: 2, h: 0.04, fill: { color: GOLD } });

    const dashData = [
      { label: 'High Risk', num: counts.high, color: 'DC2626', bg: 'FEF2F2' },
      { label: 'Medium Risk', num: counts.medium, color: 'D97706', bg: 'FFFBEB' },
      { label: 'Low Risk', num: counts.low, color: '059669', bg: 'ECFDF5' },
      { label: 'Recommendations', num: counts.rec, color: '2563EB', bg: 'EFF6FF' },
    ];
    dashData.forEach((d, i) => {
      const x = 0.5 + i * 3.1;
      s2.addShape(pptx.ShapeType.roundRect, { x, y: 1.2, w: 2.8, h: 1.4, fill: { color: d.bg }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.1 });
      s2.addText(String(d.num), { x, y: 1.3, w: 2.8, h: 0.8, fontSize: 40, color: d.color, align: 'center', bold: true, fontFace: 'Calibri' });
      s2.addText(d.label, { x, y: 2.1, w: 2.8, h: 0.4, fontSize: 11, color: '64748b', align: 'center', fontFace: 'Calibri' });
    });

    if (summary) {
      s2.addText('Risk Summary', { x: 0.5, y: 3.0, w: 8, h: 0.4, fontSize: 14, color: NAVY, bold: true, fontFace: 'Calibri' });
      s2.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 3.4, w: 12.33, h: 1.2, fill: { color: 'F8F6F0' }, line: { color: 'E5E1D8', width: 1 }, rectRadius: 0.1 });
      s2.addText(summary, { x: 0.7, y: 3.5, w: 11.93, h: 1.0, fontSize: 12, color: '334155', fontFace: 'Calibri', valign: 'top', wrap: true });
    }

    if (actions) {
      const ay = summary ? 4.8 : 3.0;
      s2.addText('Key Actions', { x: 0.5, y: ay, w: 8, h: 0.4, fontSize: 14, color: NAVY, bold: true, fontFace: 'Calibri' });
      s2.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: ay + 0.4, w: 12.33, h: 1.6, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 }, rectRadius: 0.1 });
      s2.addText(actions, { x: 0.7, y: ay + 0.5, w: 11.93, h: 1.4, fontSize: 11, color: '334155', fontFace: 'Calibri', valign: 'top', wrap: true });
    }

    // Slide 3+: Findings (4 per slide)
    const perSlide = 4;
    for (let p = 0; p < Math.ceil(items.length / perSlide); p++) {
      const s = pptx.addSlide();
      s.addText(`Detailed Findings (${p * perSlide + 1}–${Math.min((p + 1) * perSlide, items.length)} of ${items.length})`, { x: 0.5, y: 0.3, w: 10, h: 0.5, fontSize: 20, color: NAVY, bold: true, fontFace: 'Calibri' });
      s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.8, w: 2, h: 0.04, fill: { color: GOLD } });

      const pageItems = items.slice(p * perSlide, (p + 1) * perSlide);
      pageItems.forEach((item, i) => {
        const y = 1.1 + i * 1.4;
        const c = sevColors[item.type].replace('#', '');
        s.addShape(pptx.ShapeType.roundRect, { x: 0.5, y, w: 12.33, h: 1.2, fill: { color: item.type === 'high' ? 'FEF2F2' : item.type === 'medium' ? 'FFFBEB' : item.type === 'low' ? 'ECFDF5' : item.type === 'rec' ? 'EFF6FF' : 'F9FAFB' }, line: { color: c, width: 1 }, rectRadius: 0.08 });
        s.addShape(pptx.ShapeType.rect, { x: 0.5, y, w: 0.08, h: 1.2, fill: { color: c } });
        s.addText(sevLabels[item.type], { x: 0.8, y: y + 0.08, w: 1.8, h: 0.3, fontSize: 9, color: 'FFFFFF', bold: true, fontFace: 'Calibri', fill: { color: c }, align: 'center', valign: 'middle' });
        s.addText(item.title, { x: 2.8, y: y + 0.05, w: 9.8, h: 0.35, fontSize: 13, color: NAVY, bold: true, fontFace: 'Calibri' });
        s.addText(item.body.slice(0, 280) + (item.body.length > 280 ? '...' : ''), { x: 0.8, y: y + 0.42, w: 11.8, h: 0.7, fontSize: 10, color: '475569', fontFace: 'Calibri', valign: 'top', wrap: true });
      });
    }

    // Final slide
    const sf = pptx.addSlide();
    sf.background = { fill: NAVY };
    sf.addText('⚖  PEOPLEOPS AI', { x: 0, y: 2.4, w: '100%', h: 0.6, fontSize: 24, color: GOLD, align: 'center', fontFace: 'Calibri' });
    sf.addText('Thank You', { x: 0, y: 3.2, w: '100%', h: 0.6, fontSize: 32, color: 'FFFFFF', align: 'center', fontFace: 'Calibri', bold: true });
    sf.addText('Draft for HR leadership review — not HR advice', { x: 0, y: 4.2, w: '100%', h: 0.4, fontSize: 12, color: '94a3b8', align: 'center', fontFace: 'Calibri', italic: true });
    sf.addText(`${title}  |  ${ts}  |  CONFIDENTIAL`, { x: 0, y: 6.4, w: '100%', h: 0.3, fontSize: 10, color: '64748b', align: 'center', fontFace: 'Calibri' });

    pptx.writeFile({ fileName: `${fname}-${ts}.pptx` });
  }
}

function exportChat(messages, format) {
  const ts = new Date().toISOString().split('T')[0];
  const content = messages.map(m => `[${m.role.toUpperCase()}] ${m.text}`).join('\n\n---\n\n');

  if (format === 'html') {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>PeopleOps AI — Session ${ts}</title>
<style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:20px;color:#1a1a2e}
h1{color:#16213e;border-bottom:3px solid #c9a84c;padding-bottom:12px}
.msg{margin:20px 0;padding:18px;border-radius:10px}
.user{background:#f0f4f8;border-left:4px solid #c9a84c}
.assistant{background:#fafaf5;border-left:4px solid #16213e}
.role{font-weight:bold;text-transform:uppercase;font-size:11px;letter-spacing:1.5px;margin-bottom:8px;color:#666}
.time{font-size:11px;color:#999;margin-top:8px}
.footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;font-size:12px;color:#999;text-align:center}
</style></head><body>
<h1>⚖ PeopleOps AI — Legal Session Export</h1>
<p style="color:#666">Generated: ${ts} | Messages: ${messages.length}</p>
${messages.map(m => `<div class="msg ${m.role}"><div class="role">${m.role === 'user' ? '👤 You' : '⚖ HR AI'}</div><div>${m.text.replace(/\n/g, '<br>')}</div><div class="time">${m.time?.toLocaleString() || ''}</div></div>`).join('')}
<div class="footer">PeopleOps AI — HR Intelligence Platform | Draft for HR leadership review only</div>
</body></html>`;
    downloadBlob(new Blob([html], { type: 'text/html' }), `lexicon-session-${ts}.html`);
  } else if (format === 'txt') {
    const txt = `PEOPLEOPS AI — LEGAL SESSION EXPORT\nDate: ${ts}\n${'═'.repeat(60)}\n\n${content}\n\n${'═'.repeat(60)}\nDraft for HR leadership review only.`;
    downloadBlob(new Blob([txt], { type: 'text/plain' }), `lexicon-session-${ts}.txt`);
  } else if (format === 'csv') {
    const csv = 'Role,Message,Timestamp\n' + messages.map(m =>
      `"${m.role}","${m.text.replace(/"/g, '""').replace(/\n/g, ' ')}","${m.time?.toISOString() || ''}"`
    ).join('\n');
    downloadBlob(new Blob([csv], { type: 'text/csv' }), `lexicon-session-${ts}.csv`);
  }
}

/* ─── MAIN APP ─── */
export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [area, setArea] = useState(null);
  const [skill, setSkill] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [docIdx, setDocIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [ready, setReady] = useState(false);
  const [apiOk, setApiOk] = useState(null);
  const [authCode, setAuthCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [agentRunning, setAgentRunning] = useState(null);
  const [agentResults, setAgentResults] = useState({});
  const [vendorDoc, setVendorDoc] = useState(null);
  const [orgDoc, setOrgDoc] = useState(null);
  const [agentMode, setAgentMode] = useState('review');
  const chatEnd = useRef(null);
  const fileRef = useRef(null);
  const agentFileRef = useRef(null);
  const vendorFileRef = useRef(null);
  const orgFileRef = useRef(null);

  useEffect(() => { setTimeout(() => setReady(true), 80); }, []);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);
  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(d => setApiOk(d.apiConfigured)).catch(() => setApiOk(false));
  }, []);

  /* ─── SEND MESSAGE ─── */
  const send = async () => {
    if (!input.trim() && files.length === 0) return;
    const userMsg = { role: 'user', text: input, files: files.map(f => f.name), time: new Date() };
    setMsgs(prev => [...prev, userMsg]);
    const fileContents = files
      .filter(f => f.content && f.content !== '[Binary file — content not readable as text]')
      .map(f => `\n\n--- UPLOADED FILE: ${f.name} ---\n${f.content}\n--- END FILE ---`)
      .join('');
    const fileNames = files.length > 0 ? '\n[Attached files: ' + files.map(f => f.name).join(', ') + ']' : '';
    const prompt = (input + fileNames + fileContents).trim() || 'Please analyze the attached document(s).';
    setInput('');
    setLoading(true);

    const sys = `You are a senior HR AI assistant for a high-profile in-house HR team. You provide specific, actionable analysis with exact wording recommendations that the HR team can accept or reject.

RULES:
1. ANALYZE the actual content NOW. Never describe what you would do — do it.
2. Never ask to proceed. Deliver the full analysis immediately.
3. Content between --- UPLOADED FILE --- markers IS the document. Read every section.

OUTPUT FORMAT — use these exact markers. The UI parses them into a structured report:

## REPORT: [Document Name] Analysis

For EACH finding, use this EXACT multi-line format (all 5 lines required):

🔴 F-[NNN] | HIGH RISK | [Section Reference] — [Short Title]
REFERENCE: [Section number, clause title, and specific paragraph/subsection location]
ISSUE: [Clear description of the risk, referencing specific language from the document]
CURRENT WORDING: "[Quote the exact problematic language from the document]"
RECOMMENDED WORDING: "[Provide specific replacement language the HR team can adopt or reject]"

Use 🔴 for HIGH RISK, 🟡 for MEDIUM RISK, 🟢 for LOW RISK, 💡 for RECOMMENDATION, 📋 for FINDING.
Number findings sequentially: F-001, F-002, F-003, etc.
Every finding MUST include all 5 lines. For recommendations, CURRENT WORDING can be "N/A" and RECOMMENDED WORDING contains the suggested addition.

## RISK SUMMARY
Write a professional executive summary (3-4 sentences): overall risk posture, the most critical exposure areas, and a clear accept/reject/negotiate recommendation. Include a one-line risk rating like "Overall Risk Rating: HIGH — significant commercial and legal exposure requiring negotiation before execution."

## KEY ACTIONS
For each action use this exact format:
KA-[N] | [HIGH/MEDIUM/LOW] | [Section reference] | [What needs to change] | [Specific recommendation with proposed wording or approach]

Number actions KA-1, KA-2, etc. Order by priority (highest risk first). Each action must reference the finding number (F-NNN) it relates to.

End with exactly: ---
Draft for HR leadership review — not HR advice.

QUALITY RULES:
- Quote EXACT language from the document in CURRENT WORDING fields
- RECOMMENDED WORDING must be specific enough to copy-paste into a redline
- Reference section numbers, clause titles, and subsection identifiers
- Include dollar amounts, dates, percentages when present in the document
- Be precise: "Section 7.3, paragraph 2" not just "the IP section"

${skill ? 'ACTIVE SKILL: "' + skill.name + '" — ' + skill.desc + '. Apply this methodology.' : ''}
${files.length > 0 ? 'Documents provided inline. Analyze fully.' : ''}`;

    try {
      const history = msgs.filter(m => m.role === 'user' || m.role === 'assistant').slice(-8)
        .map(m => ({ role: m.role, content: m.text }));
      const text = await chatAPI({ messages: [...history, { role: 'user', content: prompt }], system: sys });
      setMsgs(prev => [...prev, { role: 'assistant', text, time: new Date() }]);
    } catch (err) {
      setMsgs(prev => [...prev, { role: 'assistant', text: `⚠ ${err.message}`, time: new Date() }]);
    }
    setLoading(false);
    setFiles([]);
  };

  /* ─── FILE HANDLING ─── */
  const onFiles = useCallback((fileList) => {
    Array.from(fileList).forEach(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      const meta = {
        name: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB',
        ext: ext.toUpperCase(),
        content: null,
        reading: true,
      };
      setFiles(prev => [...prev, meta]);

      const updateContent = (text) => {
        setFiles(prev => prev.map(file =>
          file.name === f.name && file.reading
            ? { ...file, content: text.slice(0, 50000), reading: false }
            : file
        ));
      };

      const markFailed = (msg) => {
        setFiles(prev => prev.map(file =>
          file.name === f.name && file.reading
            ? { ...file, content: msg, reading: false }
            : file
        ));
      };

      // DOCX — use mammoth to extract text
      if (ext === 'docx' || ext === 'doc') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
            if (result.value && result.value.trim().length > 0) {
              updateContent(result.value);
            } else {
              markFailed('[Document appears empty or could not be parsed]');
            }
          } catch (err) {
            markFailed('[Failed to extract text from DOCX: ' + err.message + ']');
          }
        };
        reader.onerror = () => markFailed('[Failed to read file]');
        reader.readAsArrayBuffer(f);
      }
      // Plain text formats — read directly
      else if (['txt','csv','md','json','xml','html','htm','yaml','yml','log','tsv','rtf','eml'].includes(ext)) {
        const reader = new FileReader();
        reader.onload = (e) => updateContent(e.target.result);
        reader.onerror = () => markFailed('[Failed to read file]');
        reader.readAsText(f);
      }
      // Binary files — flag as unreadable
      else {
        markFailed('[Binary file (' + ext.toUpperCase() + ') — text extraction not supported in browser. For PDFs, please copy-paste the text or use a .txt/.docx version.]');
      }
    });
  }, []);

  const onDrop = useCallback((e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }, [onFiles]);

  /* ─── DOCUMENT COMPARISON READER ─── */
  const readDocFile = (file, setter) => {
    const ext = file.name.split('.').pop().toLowerCase();
    setter({ name: file.name, ext: ext.toUpperCase(), content: null, reading: true });

    if (ext === 'docx' || ext === 'doc') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
          setter({ name: file.name, ext: ext.toUpperCase(), content: result.value?.slice(0, 50000) || '[Empty document]', reading: false });
        } catch (err) {
          setter({ name: file.name, ext: ext.toUpperCase(), content: '[Failed to extract text]', reading: false });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setter({ name: file.name, ext: ext.toUpperCase(), content: e.target.result?.slice(0, 50000), reading: false });
      reader.onerror = () => setter({ name: file.name, ext: ext.toUpperCase(), content: '[Failed to read file]', reading: false });
      reader.readAsText(file);
    }
  };

  const runComparison = async () => {
    if (!vendorDoc?.content || !orgDoc?.content) return;
    if (vendorDoc.reading || orgDoc.reading) return;

    const userMsg = { role: 'user', text: `📋 Compare & Comply: "${vendorDoc.name}" vs "${orgDoc.name}"`, files: [vendorDoc.name, orgDoc.name], time: new Date() };
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);

    const compareSys = `You are a senior HR AI assistant performing a Document Comparison & Compliance Review.

You are comparing a VENDOR/CUSTOMER DOCUMENT against the ORGANIZATION'S STANDARD/PLAYBOOK.

RULES:
1. Go clause by clause through the vendor document
2. Compare each clause against the org standard
3. Identify: missing clauses, non-compliant language, weaker protections, missing definitions, unfavorable terms
4. For each finding, provide the EXACT current wording and your RECOMMENDED replacement wording

OUTPUT FORMAT:
## REPORT: Document Comparison — ${vendorDoc.name} vs ${orgDoc.name}

For each finding use this exact format:
🔴 F-[NNN] | HIGH RISK | [Section/Clause] — [Short Title]
REFERENCE: [Section number and clause title in the vendor document]
ISSUE: [What's wrong — missing from vendor doc, non-compliant, weaker than org standard, etc.]
CURRENT WORDING: "[Exact quote from the vendor/customer document]"
RECOMMENDED WORDING: "[Specific replacement language aligned with org standard that the team can accept or reject]"

Severity guide:
🔴 HIGH RISK — Material deviation from org standard, missing critical protections, non-compliant terms
🟡 MEDIUM RISK — Weaker language than org standard, ambiguous terms, missing definitions
🟢 LOW RISK — Minor deviations, stylistic differences, nice-to-have improvements
💡 RECOMMENDATION — Suggested additions not in either document, best practice enhancements

## RISK SUMMARY
Overall compliance rating (e.g., "65% aligned with organizational standards"). Critical gaps summary. Accept/reject/negotiate recommendation.

## KEY ACTIONS
KA-[N] | [HIGH/MEDIUM/LOW] | [Section ref] | [Non-compliance issue] | [Specific action with recommended language]

End with: ---
Draft for HR leadership review — not HR advice.

${skill ? 'ACTIVE SKILL: "' + skill.name + '" — ' + skill.desc : ''}`;

    const prompt = `VENDOR/CUSTOMER DOCUMENT: "${vendorDoc.name}"
--- DOCUMENT START ---
${vendorDoc.content}
--- DOCUMENT END ---

ORGANIZATION STANDARD/PLAYBOOK: "${orgDoc.name}"
--- DOCUMENT START ---
${orgDoc.content}
--- DOCUMENT END ---

Compare the vendor document against the organization standard. Identify every deviation, missing clause, non-compliant term, and weaker protection. Provide specific replacement wording for each finding.`;

    try {
      const text = await chatAPI({ messages: [{ role: 'user', content: prompt }], system: compareSys });
      setMsgs(prev => [...prev, { role: 'assistant', text, time: new Date() }]);
    } catch (err) {
      setMsgs(prev => [...prev, { role: 'assistant', text: `⚠ ${err.message}`, time: new Date() }]);
    }
    setLoading(false);
  };

  /* ─── AGENT RUNNER ─── */
  const AGENT_CONFIGS = {
    renewal: {
      name: 'Renewal Watcher',
      icon: '📅',
      color: '#C9A84C',
      desc: 'Scans your contract register for upcoming renewal and cancellation deadlines. Flags contracts requiring action in the next 30, 60, and 90 days.',
      sampleData: SAMPLE_CONTRACT_REGISTER,
      sampleLabel: '20 contracts with various deadlines',
      acceptTypes: '.csv,.xlsx,.txt',
      prompt: (data) => `You are the Renewal Watcher managed agent. Analyze this contract register and produce a structured alert report.

Today's date is ${new Date().toISOString().split('T')[0]}.

For each contract, calculate:
- Days until expiration
- Whether it auto-renews
- Whether the cancel-notice window has passed or is approaching
- Risk level based on value and timeline

OUTPUT FORMAT:
## REPORT: Contract Renewal Alert — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

For each contract needing attention, use:
🔴 F-[NNN] | HIGH RISK | [Contract ID] — [Title]
REFERENCE: Contract [ID], [Vendor], expires [date], auto-renew: [Y/N], cancel notice: [days]
ISSUE: [What's happening — approaching deadline, missed cancel window, etc.]
CURRENT WORDING: "[Contract value and current terms]"
RECOMMENDED WORDING: "[Specific action to take — cancel, renegotiate, extend, etc. with timeline]"

Use 🔴 for urgent (within 30 days or cancel window passed), 🟡 for approaching (30-90 days), 🟢 for monitoring (90+ days), 💡 for recommendations.

## RISK SUMMARY
Executive summary of the portfolio health, total value at risk, and critical deadlines.

## KEY ACTIONS
KA-[N] | [HIGH/MEDIUM/LOW] | [Contract ID] | [Issue] | [Action required with specific date]

CONTRACT REGISTER DATA:
${data}`,
    },
    regmonitor: {
      name: 'Reg Monitor',
      icon: '📋',
      color: '#8B6F47',
      desc: 'Analyzes regulatory updates for impact on your organization. Produces a prioritized digest with compliance gap analysis and recommended actions.',
      sampleData: SAMPLE_REG_UPDATES,
      sampleLabel: '7 regulatory updates (SEC, FTC, HHS, DOJ, EU, CA, NY)',
      acceptTypes: '.txt,.csv,.pdf',
      prompt: (data) => `You are the Regulatory Monitor managed agent. Analyze these regulatory updates and produce an impact assessment report for a multinational technology company operating in financial services, healthcare technology, and enterprise SaaS.

OUTPUT FORMAT:
## REPORT: Regulatory Digest — Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

For each regulatory item, assess:
🔴 F-[NNN] | HIGH RISK | [Agency/Regulator] — [Rule Title]
REFERENCE: [Citation, effective date, comment deadline if applicable]
ISSUE: [What this regulation requires, who it affects, and why it matters to our business]
CURRENT WORDING: "[Key requirement or threshold from the regulation]"
RECOMMENDED WORDING: "[Specific compliance action — policy update, process change, filing required, etc.]"

Use 🔴 for immediate action required, 🟡 for planning needed, 🟢 for monitoring, 💡 for strategic recommendations.

## RISK SUMMARY
Overall regulatory landscape assessment, most impactful changes, and resource implications.

## KEY ACTIONS
KA-[N] | [HIGH/MEDIUM/LOW] | [Regulation reference] | [Gap identified] | [Compliance action with deadline]

REGULATORY DATA:
${data}`,
    },
    launchradar: {
      name: 'Launch Radar',
      icon: '🚀',
      color: '#5B9BD5',
      desc: 'Reviews pending product launches for legal risk. Assesses privacy, regulatory, IP, and commercial exposure before go-live.',
      sampleData: SAMPLE_LAUNCH_ITEMS,
      sampleLabel: '5 product launches pending legal review',
      acceptTypes: '.txt,.csv',
      prompt: (data) => `You are the Launch Radar managed agent. Analyze these pending product launches and produce a legal risk assessment for each. You are reviewing for a multinational technology company.

Assess each launch for:
- Privacy/data protection risks (GDPR, CCPA, BIPA, HIPAA)
- AI/algorithmic risks (EU AI Act, FTC guidance, state laws)
- Consumer protection risks
- Employment law risks
- IP risks
- Regulatory compliance risks

OUTPUT FORMAT:
## REPORT: Launch Radar — Legal Risk Assessment

For each launch item:
🔴 F-[NNN] | HIGH RISK | [Launch ID] — [Product Name]
REFERENCE: [Launch ID, target date, risk flags identified]
ISSUE: [Specific legal risk with regulatory citations]
CURRENT WORDING: "[Current product/feature description that creates risk]"
RECOMMENDED WORDING: "[Specific mitigation — what needs to change before launch, required disclosures, consent mechanisms, etc.]"

## RISK SUMMARY
Portfolio-level launch risk assessment. Which launches can proceed, which need holds, which need modifications.

## KEY ACTIONS
KA-[N] | [HIGH/MEDIUM/LOW] | [Launch ID] | [Risk area] | [Required action before launch with specific recommendation]

LAUNCH DATA:
${data}`,
    },
  };

  const runAgent = async (agentId, customData) => {
    const config = AGENT_CONFIGS[agentId];
    if (!config) return;
    setAgentRunning(agentId);

    const data = customData || config.sampleData;
    const userPrompt = config.prompt(data);

    try {
      const text = await chatAPI({
        messages: [{ role: 'user', content: userPrompt }],
        system: 'You are a managed legal agent. Follow the output format exactly. Every finding must use the structured F-NNN format with all 5 required lines (header, REFERENCE, ISSUE, CURRENT WORDING, RECOMMENDED WORDING). Be specific and actionable. End with: ---\nDraft for HR leadership review — not HR advice.',
      });
      setAgentResults(prev => ({ ...prev, [agentId]: { text, time: new Date(), data: customData ? 'Custom upload' : 'Sample data' } }));
    } catch (err) {
      setAgentResults(prev => ({ ...prev, [agentId]: { text: `⚠ Agent error: ${err.message}`, time: new Date(), data: 'Error' } }));
    }
    setAgentRunning(null);
  };

  /* ─── FILTERED AREAS ─── */
  const filtered = search
    ? PRACTICE_AREAS.map(a => ({ ...a, skills: a.skills.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.desc.toLowerCase().includes(search.toLowerCase())
      ) })).filter(a => a.skills.length > 0 || a.name.toLowerCase().includes(search.toLowerCase()))
    : PRACTICE_AREAS;

  /* ─── TABS ─── */
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '◈' },
    { id: 'skills', label: 'Practice Areas', icon: '◆' },
    { id: 'agents', label: 'Agents', icon: '⟐' },
    { id: 'agent', label: 'AI Agent', icon: '⬡' },
    { id: 'docs', label: 'Documents', icon: '▣' },
    { id: 'guide', label: 'User Guide', icon: '◎' },
    { id: 'security', label: 'Security', icon: '◉' },
  ];

  return (
    <div className="app">
      <div className="grain-overlay" />

      {/* ══════ NAV ══════ */}
      <header className="nav-wrap">
        <nav className="nav">
          <div className="logo">
            <div className="logo-text">⚖ PEOPLEOPS AI</div>
            <div className="logo-sub">HR Intelligence Platform</div>
          </div>
          <div className="nav-tabs">
            {tabs.map(t => (
              <button key={t.id} className={`nav-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => { setTab(t.id); if (t.id !== 'skills') setArea(null); }}>
                <span className="tab-icon">{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
          <div className="nav-status">
            <span className={`status-dot ${apiOk ? 'ok' : 'err'}`} />
            <span className="status-text">{apiOk === null ? 'Checking…' : apiOk ? 'API Connected' : 'API Key Missing'}</span>
          </div>
        </nav>
      </header>

      <main className="main">

        {/* ══════════════════ DASHBOARD ══════════════════ */}
        {tab === 'dashboard' && (
          <div className={`fade-wrapper ${ready ? 'visible' : ''}`}>
            <section className="hero-card">
              <div className="hero-glow" />
              <div className="hero-content">
                <h1 className="hero-title">HR Agent Command Center</h1>
                <p className="hero-subtitle">
                  Powered by Claude for HR — {PRACTICE_AREAS.length} practice areas, {totalSkills} AI skills,
                  {MANAGED_AGENTS.length} managed agents, and {CONNECTORS.length}+ MCP connectors including
                  Ironclad, DocuSign, iManage, Everlaw, and CourtListener.
                  Every output is a draft for HR leadership review.
                </p>
                <div className="stats-row">
                  {[
                    { n: PRACTICE_AREAS.length, l: 'Practice Areas' },
                    { n: totalSkills, l: 'AI Skills' },
                    { n: MANAGED_AGENTS.length, l: 'Managed Agents' },
                    { n: `${CONNECTORS.length}+`, l: 'MCP Connectors' },
                    { n: SAMPLE_DOCS.length, l: 'Sample Docs' },
                    { n: VULN_REPORT.length, l: 'Security Checks' },
                  ].map((s, i) => (
                    <div key={i} className={`stat-card animate-in stagger-${i + 1}`}>
                      <div className="stat-num">{s.n}</div>
                      <div className="stat-label">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <h2 className="section-title">PRACTICE AREAS</h2>
            <div className="area-grid">
              {PRACTICE_AREAS.map((a, i) => (
                <div key={a.id} className={`area-card animate-in stagger-${Math.min(i + 1, 12)}`}
                  style={{ '--accent': a.color }}
                  onClick={() => { setTab('skills'); setArea(a); }}>
                  <span className="area-icon">{a.icon}</span>
                  <div className="area-name">{a.name}</div>
                  <div className="area-desc">{a.desc}</div>
                  <span className="skill-count">{a.skills.length} skills</span>
                </div>
              ))}
            </div>

            <div className="managed-agents-section">
              <h2 className="section-title">MANAGED AGENTS</h2>
              <div className="agents-row">
                {MANAGED_AGENTS.map((ag, i) => (
                  <div key={i} className="agent-chip">
                    <span className="agent-icon">⟐</span>
                    <div>
                      <div className="agent-name">{ag.name}</div>
                      <div className="agent-desc">{ag.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="disclaimer">
              <strong>⚠ Important Notice:</strong> Every output from this platform is a draft for HR leadership review — not HR advice,
              not a legal conclusion, not a substitute for a lawyer. Built with guardrails: source attribution, conservative
              defaults on privilege, jurisdiction assumptions surfaced, and explicit gates before anything is filed or sent.
            </div>
          </div>
        )}

        {/* ══════════════════ SKILLS BROWSER ══════════════════ */}
        {tab === 'skills' && (
          <div className="fade-wrapper visible">
            {/* Search + Filter Bar */}
            <div className="skills-toolbar">
              <div className="search-wrap" style={{ marginBottom: 0 }}>
                <span className="search-icon">⌕</span>
                <input className="search-input" style={{ marginBottom: 0 }} placeholder="Search across all practice areas and skills…"
                  value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
              </div>
              <div className="area-filter-chips">
                <button className={`filter-chip ${!area ? 'filter-active' : ''}`} onClick={() => setArea(null)}>All Areas ({totalSkills})</button>
                {PRACTICE_AREAS.map(a => (
                  <button key={a.id}
                    className={`filter-chip ${area?.id === a.id ? 'filter-active' : ''}`}
                    style={{ '--chip-color': a.color }}
                    onClick={() => setArea(area?.id === a.id ? null : a)}>
                    {a.icon} {a.name} ({a.skills.length})
                  </button>
                ))}
              </div>
            </div>

            {/* Skills List */}
            {!area && !search ? (
              /* Grid of practice area cards */
              <div className="area-grid">
                {PRACTICE_AREAS.map(a => (
                  <div key={a.id} className="area-card" style={{ '--accent': a.color }}
                    onClick={() => setArea(a)}>
                    <span className="area-icon">{a.icon}</span>
                    <div className="area-name">{a.name}</div>
                    <div className="area-desc">{a.desc}</div>
                    <span className="skill-count">{a.skills.length} skills</span>
                  </div>
                ))}
              </div>
            ) : (
              /* Flat skills list — filtered by area and/or search */
              <div>
                {area && !search && (
                  <div className="area-header">
                    <span style={{ fontSize: 40 }}>{area.icon}</span>
                    <div>
                      <h2 style={{ color: 'var(--text-primary)', fontSize: 26 }}>{area.name}</h2>
                      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 14 }}>{area.desc}</p>
                    </div>
                  </div>
                )}
                <div className="skill-panel">
                  {(search ? filtered : (area ? [area] : PRACTICE_AREAS)).map(a =>
                    a.skills
                      .filter(s => !s.tag || s.tag !== 'setup' || search) // hide setup skills unless searching
                      .map(s => (
                        <div key={`${a.id}-${s.id}`} className={`skill-item ${skill?.id === s.id ? 'active' : ''}`}
                          onClick={() => setSkill(s)}>
                          {(search || !area) && <span className="skill-area-badge" style={{ background: a.color + '22', color: a.color }}>{a.icon} {a.name}</span>}
                          <div className="skill-dot" style={{ background: a.color }} />
                          <div className="skill-info">
                            <div className="skill-name">{s.name} {s.tag === 'setup' && <span className="skill-setup-tag">SETUP</span>}</div>
                            <div className="skill-desc">{s.desc}</div>
                          </div>
                          <button className="btn btn-gold btn-sm" onClick={(e) => {
                            e.stopPropagation(); setSkill(s); setTab('agent');
                            setInput(`Use the "${s.name}" skill: `);
                          }}>Launch →</button>
                        </div>
                      ))
                  )}
                  {search && filtered.reduce((a, p) => a + p.skills.length, 0) === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>
                      No skills match "{search}". Try a different search term.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ AI AGENT ══════════════════ */}
        {/* ══════════════════ MANAGED AGENTS (LIVE) ══════════════════ */}
        {tab === 'agents' && (
          <div className="fade-wrapper visible">
            <section className="hero-card" style={{ marginBottom: 24 }}>
              <div className="hero-content">
                <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>⟐ Managed Agents</h2>
                <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>
                  Live AI agents that analyze your data and produce actionable reports. Run with sample data to see them in action, or upload your own files for real analysis.
                </p>
              </div>
            </section>

            <div className="agent-runner-grid">
              {Object.entries(AGENT_CONFIGS).map(([id, config]) => (
                <div key={id} className="agent-runner-card">
                  <div className="agent-runner-header" style={{ borderBottomColor: config.color }}>
                    <span style={{ fontSize: 28 }}>{config.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div className="agent-runner-name">{config.name}</div>
                      <div className="agent-runner-desc">{config.desc}</div>
                    </div>
                    <span className={`agent-status ${agentRunning === id ? 'agent-running' : agentResults[id] ? 'agent-done' : ''}`}>
                      {agentRunning === id ? '⏳ Running…' : agentResults[id] ? '✓ Complete' : '○ Ready'}
                    </span>
                  </div>

                  <div className="agent-runner-body">
                    <div className="agent-runner-actions">
                      <button
                        className="btn btn-gold"
                        disabled={agentRunning !== null}
                        onClick={() => runAgent(id)}
                      >
                        {agentRunning === id ? '⏳ Analyzing…' : `▶ Run with Sample Data`}
                      </button>
                      <span className="agent-sample-info">📊 {config.sampleLabel}</span>
                    </div>

                    <div className="agent-upload-row">
                      <span className="agent-or">— or upload your own —</span>
                      <label className="btn btn-ghost btn-sm agent-upload-btn">
                        📎 Upload File
                        <input type="file" accept={config.acceptTypes} style={{ display: 'none' }} onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => runAgent(id, ev.target.result);
                          reader.readAsText(file);
                          e.target.value = '';
                        }} />
                      </label>
                    </div>
                  </div>

                  {/* Agent Results */}
                  {agentResults[id] && (
                    <div className="agent-results">
                      <div className="agent-results-meta">
                        <span>Completed: {agentResults[id].time?.toLocaleTimeString()}</span>
                        <span>Source: {agentResults[id].data}</span>
                      </div>

                      {isReport(agentResults[id].text) ? (
                        <div className="report-card" style={{ margin: 0, border: 'none' }}>
                          <div className="report-header" style={{ borderRadius: 0 }}>
                            <span className="report-icon">⚖</span>
                            <span className="report-title">{(agentResults[id].text.match(/##\s*REPORT:\s*(.+)/i) || [,'Agent Report'])[1]}</span>
                            <div className="report-header-actions">
                              <button className="btn-export btn-export-primary" onClick={() => exportReport(agentResults[id].text, 'view')}>🔍 Full Report</button>
                              <button className="btn-export" onClick={() => exportReport(agentResults[id].text, 'pdf')}>📥 PDF</button>
                              <button className="btn-export" onClick={() => exportReport(agentResults[id].text, 'word')}>📝 Word</button>
                              <button className="btn-export" onClick={() => exportReport(agentResults[id].text, 'pptx')}>📊 PPT</button>
                              <button className="btn-export" onClick={() => exportReport(agentResults[id].text, 'csv')}>📈 Excel</button>
                            </div>
                          </div>
                          <div className="report-counts">
                            {[
                              { type: 'high', label: 'High Risk', icon: '🔴', count: (agentResults[id].text.match(/🔴/g) || []).length },
                              { type: 'medium', label: 'Medium Risk', icon: '🟡', count: (agentResults[id].text.match(/🟡/g) || []).length },
                              { type: 'low', label: 'Low Risk', icon: '🟢', count: (agentResults[id].text.match(/🟢/g) || []).length },
                              { type: 'rec', label: 'Recommendations', icon: '💡', count: (agentResults[id].text.match(/💡/g) || []).length },
                            ].filter(c => c.count > 0).map((c, j) => (
                              <span key={j} className={`count-badge count-${c.type}`}>{c.icon} {c.count} {c.label}</span>
                            ))}
                          </div>
                          <div className="report-findings">
                            {parseReport(agentResults[id].text).map((item, j) => (
                              <div key={j} className={`report-item report-item-${item.type}`}>
                                <div className="report-item-header">
                                  <span className={`report-badge report-badge-${item.type}`}>
                                    {item.type === 'high' ? '🔴 HIGH' : item.type === 'medium' ? '🟡 MEDIUM' : item.type === 'low' ? '🟢 LOW' : item.type === 'rec' ? '💡 REC' : '📋 INFO'}
                                  </span>
                                  {item.num && <span className="report-item-num">{item.num}</span>}
                                  <span className="report-item-title">{item.title}</span>
                                </div>
                                {item.section && <div className="report-item-ref">📌 {item.section}{item.reference ? ` — ${item.reference}` : ''}</div>}
                                {item.issue && <div className="report-item-issue"><strong>Issue:</strong> {item.issue}</div>}
                                {item.currentWording && <div className="report-item-current"><span className="wording-label">⛔ Current:</span> <span className="wording-quote">{item.currentWording}</span></div>}
                                {item.recommendedWording && <div className="report-item-recommended"><span className="wording-label">✅ Recommended:</span> <span className="wording-quote">{item.recommendedWording}</span></div>}
                                {!item.issue && item.body && <div className="report-item-body">{item.body}</div>}
                              </div>
                            ))}
                          </div>
                          {extractSection(agentResults[id].text, 'RISK SUMMARY') && (
                            <div className="report-summary"><div className="report-summary-title">📊 Risk Summary</div><div className="report-summary-text">{extractSection(agentResults[id].text, 'RISK SUMMARY')}</div></div>
                          )}
                          {parseKeyActions(agentResults[id].text).length > 0 && (
                            <div className="report-ka-section"><div className="report-ka-title">🎯 Key Actions Required</div><div className="report-ka-table">
                              <div className="ka-header-row"><span className="ka-col ka-col-num">#</span><span className="ka-col ka-col-sev">Risk</span><span className="ka-col ka-col-ref">Reference</span><span className="ka-col ka-col-issue">Issue</span><span className="ka-col ka-col-rec">Recommendation</span></div>
                              {parseKeyActions(agentResults[id].text).map((ka, k) => (
                                <div key={k} className={`ka-row ka-row-${ka.severity.toLowerCase().includes('high') ? 'high' : ka.severity.toLowerCase().includes('medium') ? 'medium' : 'low'}`}>
                                  <span className="ka-col ka-col-num">{ka.num}</span><span className="ka-col ka-col-sev"><span className={`ka-sev-badge ${ka.severity.toLowerCase().includes('high') ? 'ka-sev-high' : ka.severity.toLowerCase().includes('medium') ? 'ka-sev-med' : 'ka-sev-low'}`}>{ka.severity}</span></span>
                                  <span className="ka-col ka-col-ref">{ka.reference}</span><span className="ka-col ka-col-issue">{ka.issue}</span><span className="ka-col ka-col-rec">{ka.recommendation}</span>
                                </div>
                              ))}
                            </div></div>
                          )}
                        </div>
                      ) : (
                        <div style={{ padding: 20, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{agentResults[id].text}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════ AI AGENT (AUTH GATED) ══════════════════ */}
        {tab === 'agent' && !isUnlocked && (
          <div className="auth-gate">
            <div className="auth-card">
              <div className="auth-icon">🔐</div>
              <h2 className="auth-title">AI Agent Access</h2>
              <p className="auth-desc">
                The AI Agent provides live people analysis powered by Claude. 
                Enter your access code to continue. You can explore all other sections 
                of the platform — Dashboard, Practice Areas, Documents, User Guide, and 
                Security Audit — without a code.
              </p>
              <div className="auth-input-row">
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Enter access code"
                  value={authCode}
                  onChange={e => { setAuthCode(e.target.value); setAuthError(false); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      if (authCode === '625244') { setIsUnlocked(true); setAuthError(false); }
                      else { setAuthError(true); }
                    }
                  }}
                />
                <button className="btn btn-gold" onClick={() => {
                  if (authCode === '625244') { setIsUnlocked(true); setAuthError(false); }
                  else { setAuthError(true); }
                }}>Unlock</button>
              </div>
              {authError && <div className="auth-error">⚠ Invalid access code. Please try again.</div>}
              <div className="auth-demo-hint">
                <span className="auth-hint-label">Demo Access</span>
                <span className="auth-hint-text">Contact your legal operations team for the access code, or explore the platform using the tabs above.</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'agent' && isUnlocked && (
          <div className="chat-layout">
            {/* Sidebar */}
            <aside className="chat-sidebar">
              <div className="sidebar-section">
                <div className="sidebar-title">ACTIVE SKILL</div>
                {skill ? (
                  <div className="active-skill-card">
                    <div className="skill-name">{skill.name}</div>
                    <div className="skill-desc">{skill.desc}</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSkill(null)} style={{ marginTop: 10 }}>✕ Clear</button>
                  </div>
                ) : (
                  <p className="sidebar-muted">No skill selected — general HR assistant mode</p>
                )}
              </div>

              {/* ─── MODE SELECTOR ─── */}
              <div className="sidebar-section">
                <div className="mode-tabs">
                  <button className={`mode-tab ${agentMode === 'review' ? 'mode-active' : ''}`} onClick={() => setAgentMode('review')}>
                    📄 Skill Review
                  </button>
                  <button className={`mode-tab ${agentMode === 'compare' ? 'mode-active' : ''}`} onClick={() => setAgentMode('compare')}>
                    ⚖ Compare & Comply
                  </button>
                </div>

                {/* MODE 1: SKILL-BASED REVIEW */}
                {agentMode === 'review' && (
                  <div className="mode-content">
                    <p className="mode-desc">Upload a document — AI reviews it against the active skill's baseline and best practices.</p>
                    <div className="upload-zone" onClick={() => fileRef.current?.click()}
                      onDragOver={e => e.preventDefault()} onDrop={onDrop}>
                      <div style={{ fontSize: 24, marginBottom: 4 }}>📎</div>
                      <div className="upload-text">Drop file or click to upload</div>
                      <div className="upload-hint">DOCX, TXT, CSV</div>
                    </div>
                    <input ref={fileRef} type="file" multiple style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.gif,.zip,.eml"
                      onChange={e => onFiles(e.target.files)} />
                    {files.length > 0 && (
                      <div className="file-chips">
                        {files.map((f, i) => (
                          <span key={i} className="file-chip">
                            <strong>{f.ext}</strong> {f.name.length > 16 ? f.name.slice(0, 16) + '…' : f.name}
                            <span className="file-remove" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}>✕</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* MODE 2: COMPARE & COMPLY */}
                {agentMode === 'compare' && (
                  <div className="mode-content">
                    <p className="mode-desc">Upload vendor doc + your org standard. AI compares clause-by-clause and highlights deviations.</p>

                    {/* Sample Pairs */}
                    <div className="compare-samples">
                      <div className="sidebar-title" style={{ fontSize: 10, marginBottom: 6 }}>LOAD SAMPLE PAIR</div>
                      <div className="sample-pair-chips">
                        {COMPARE_PAIRS.map(p => (
                          <button key={p.id} className="btn btn-ghost btn-sm" style={{ fontSize: 10, padding: '4px 8px' }}
                            onClick={() => {
                              setVendorDoc({ name: p.vendor.name, ext: 'TXT', content: p.vendor.content, reading: false });
                              setOrgDoc({ name: p.org.name, ext: 'TXT', content: p.org.content, reading: false });
                            }}>
                            {p.icon} {p.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Vendor Doc */}
                    <div className={`compare-upload-box ${vendorDoc?.content ? 'compare-loaded' : ''}`}
                      onClick={() => vendorFileRef.current?.click()}>
                      <span className="compare-label">📄 Their Document</span>
                      {vendorDoc ? (
                        <div className="compare-file-info">
                          <span className="compare-file-name">{vendorDoc.name.length > 20 ? vendorDoc.name.slice(0, 20) + '…' : vendorDoc.name}</span>
                          {vendorDoc.reading ? <span className="compare-reading">Reading…</span> : <span className="compare-ready">✓</span>}
                          <span className="compare-remove" onClick={(e) => { e.stopPropagation(); setVendorDoc(null); }}>✕</span>
                        </div>
                      ) : (
                        <span className="compare-placeholder">Upload vendor/customer document</span>
                      )}
                    </div>
                    <input ref={vendorFileRef} type="file" style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.txt,.csv" onChange={e => { if (e.target.files[0]) readDocFile(e.target.files[0], setVendorDoc); e.target.value = ''; }} />

                    {/* Org Doc */}
                    <div className={`compare-upload-box compare-org ${orgDoc?.content ? 'compare-loaded' : ''}`}
                      onClick={() => orgFileRef.current?.click()} style={{ marginTop: 8 }}>
                      <span className="compare-label">🏢 Your Org Standard</span>
                      {orgDoc ? (
                        <div className="compare-file-info">
                          <span className="compare-file-name">{orgDoc.name.length > 20 ? orgDoc.name.slice(0, 20) + '…' : orgDoc.name}</span>
                          {orgDoc.reading ? <span className="compare-reading">Reading…</span> : <span className="compare-ready">✓</span>}
                          <span className="compare-remove" onClick={(e) => { e.stopPropagation(); setOrgDoc(null); }}>✕</span>
                        </div>
                      ) : (
                        <span className="compare-placeholder">Upload your org standard/playbook</span>
                      )}
                    </div>
                    <input ref={orgFileRef} type="file" style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.txt,.csv" onChange={e => { if (e.target.files[0]) readDocFile(e.target.files[0], setOrgDoc); e.target.value = ''; }} />

                    <button className="btn btn-gold compare-btn"
                      disabled={!vendorDoc?.content || !orgDoc?.content || vendorDoc.reading || orgDoc.reading || loading}
                      onClick={runComparison}>
                      {loading ? '⏳ Comparing…' : '⚖ Compare Documents'}
                    </button>
                  </div>
                )}
              </div>

              <div className="sidebar-section">
                <div className="sidebar-title">EXPORT SESSION</div>
                <div className="export-btns">
                  <button className="btn btn-ghost" onClick={() => exportChat(msgs, 'html')} disabled={!msgs.length}>📄 HTML</button>
                  <button className="btn btn-ghost" onClick={() => exportChat(msgs, 'txt')} disabled={!msgs.length}>📝 TXT</button>
                  <button className="btn btn-ghost" onClick={() => exportChat(msgs, 'csv')} disabled={!msgs.length}>📊 CSV</button>
                </div>
              </div>
            </aside>

            {/* Chat */}
            <div className="chat-main">
              <div className="chat-header">
                <span className="chat-title">⚖ HR AI Assistant</span>
                {msgs.length > 0 && <button className="btn btn-ghost btn-sm" onClick={() => setMsgs([])}>Clear Chat</button>}
              </div>

              <div className="chat-messages">
                {msgs.length === 0 && (
                  <div className="chat-empty">
                    <div className="empty-icon">⚖</div>
                    <div className="empty-title">HR AI Assistant Ready</div>
                    <p className="empty-desc">
                      Ask about contracts, compliance, litigation strategy, privacy, IP, or any HR topic.
                      Upload documents for analysis. Select a skill for specialized workflows.
                    </p>
                    {apiOk === false && (
                      <div className="api-warning">
                        ⚠ ANTHROPIC_API_KEY not configured. Add it as a Railway environment variable to enable AI chat.
                      </div>
                    )}
                    <div className="quick-prompts">
                      {['Review this NDA', 'Draft a legal hold notice', 'Triage this DSAR', 'Check marketing claims', 'Worker classification analysis'].map(q => (
                        <button key={q} className="btn btn-ghost btn-sm" onClick={() => setInput(q)}>{q}</button>
                      ))}
                    </div>
                  </div>
                )}

                {msgs.map((m, i) => (
                  <div key={i} className={`msg ${m.role} ${m.role === 'assistant' && isReport(m.text) ? 'msg-report' : ''}`}>
                    {m.files?.length > 0 && (
                      <div className="msg-files">{m.files.map((f, j) => <span key={j} className="file-chip">📎 {f}</span>)}</div>
                    )}

                    {m.role === 'assistant' && isReport(m.text) ? (
                      <div className="report-card">
                        {/* Report Header with Download Buttons */}
                        <div className="report-header">
                          <span className="report-icon">⚖</span>
                          <span className="report-title">{(m.text.match(/##\s*REPORT:\s*(.+)/i) || [,'People Analysis Report'])[1]}</span>
                          <div className="report-header-actions">
                            <button className="btn-export btn-export-primary" onClick={() => exportReport(m.text, 'view')}>🔍 Full Report</button>
                            <button className="btn-export" onClick={() => exportReport(m.text, 'pdf')}>📥 PDF</button>
                            <button className="btn-export" onClick={() => exportReport(m.text, 'word')}>📝 Word</button>
                            <button className="btn-export" onClick={() => exportReport(m.text, 'pptx')}>📊 PPT</button>
                            <button className="btn-export" onClick={() => exportReport(m.text, 'csv')}>📈 Excel</button>
                          </div>
                        </div>

                        {/* Risk summary counts */}
                        <div className="report-counts">
                          {[
                            { type: 'high', label: 'High Risk', icon: '🔴', count: (m.text.match(/🔴/g) || []).length },
                            { type: 'medium', label: 'Medium Risk', icon: '🟡', count: (m.text.match(/🟡/g) || []).length },
                            { type: 'low', label: 'Low Risk', icon: '🟢', count: (m.text.match(/🟢/g) || []).length },
                            { type: 'rec', label: 'Recommendations', icon: '💡', count: (m.text.match(/💡/g) || []).length },
                          ].filter(c => c.count > 0).map((c, j) => (
                            <span key={j} className={`count-badge count-${c.type}`}>{c.icon} {c.count} {c.label}</span>
                          ))}
                        </div>

                        {/* Findings */}
                        <div className="report-findings">
                          {parseReport(m.text).map((item, j) => (
                            <div key={j} className={`report-item report-item-${item.type}`}>
                              <div className="report-item-header">
                                <span className={`report-badge report-badge-${item.type}`}>
                                  {item.type === 'high' ? '🔴 HIGH' : item.type === 'medium' ? '🟡 MEDIUM' : item.type === 'low' ? '🟢 LOW' : item.type === 'rec' ? '💡 REC' : '📋 INFO'}
                                </span>
                                {item.num && <span className="report-item-num">{item.num}</span>}
                                <span className="report-item-title">{item.title}</span>
                              </div>
                              {item.section && <div className="report-item-ref">📌 {item.section}{item.reference ? ` — ${item.reference}` : ''}</div>}
                              {item.issue && <div className="report-item-issue"><strong>Issue:</strong> {item.issue}</div>}
                              {item.currentWording && <div className="report-item-current"><span className="wording-label">⛔ Current:</span> <span className="wording-quote">{item.currentWording}</span></div>}
                              {item.recommendedWording && <div className="report-item-recommended"><span className="wording-label">✅ Recommended:</span> <span className="wording-quote">{item.recommendedWording}</span></div>}
                              {!item.issue && item.body && <div className="report-item-body">{item.body}</div>}
                            </div>
                          ))}
                        </div>

                        {/* Risk Summary */}
                        {extractSection(m.text, 'RISK SUMMARY') && (
                          <div className="report-summary">
                            <div className="report-summary-title">📊 Risk Summary</div>
                            <div className="report-summary-text">{extractSection(m.text, 'RISK SUMMARY')}</div>
                          </div>
                        )}

                        {/* Key Actions Table */}
                        {parseKeyActions(m.text).length > 0 && (
                          <div className="report-ka-section">
                            <div className="report-ka-title">🎯 Key Actions Required</div>
                            <div className="report-ka-table">
                              <div className="ka-header-row">
                                <span className="ka-col ka-col-num">#</span>
                                <span className="ka-col ka-col-sev">Risk</span>
                                <span className="ka-col ka-col-ref">Reference</span>
                                <span className="ka-col ka-col-issue">Issue</span>
                                <span className="ka-col ka-col-rec">Recommendation</span>
                              </div>
                              {parseKeyActions(m.text).map((ka, k) => (
                                <div key={k} className={`ka-row ka-row-${ka.severity.toLowerCase().includes('high') ? 'high' : ka.severity.toLowerCase().includes('medium') ? 'medium' : 'low'}`}>
                                  <span className="ka-col ka-col-num">{ka.num}</span>
                                  <span className="ka-col ka-col-sev"><span className={`ka-sev-badge ${ka.severity.toLowerCase().includes('high') ? 'ka-sev-high' : ka.severity.toLowerCase().includes('medium') ? 'ka-sev-med' : 'ka-sev-low'}`}>{ka.severity}</span></span>
                                  <span className="ka-col ka-col-ref">{ka.reference}</span>
                                  <span className="ka-col ka-col-issue">{ka.issue}</span>
                                  <span className="ka-col ka-col-rec">{ka.recommendation}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Bottom export bar */}
                        <div className="report-bottom-bar">
                          <span className="report-disclaimer-inline">Draft for HR leadership review — not HR advice.</span>
                          <div className="report-bottom-actions">
                            <button className="btn-export btn-export-primary" onClick={() => exportReport(m.text, 'view')}>🔍 View Full Report</button>
                            <button className="btn-export" onClick={() => exportReport(m.text, 'pdf')}>📥 PDF</button>
                            <button className="btn-export" onClick={() => exportReport(m.text, 'word')}>📝 Word</button>
                            <button className="btn-export" onClick={() => exportReport(m.text, 'pptx')}>📊 PPT</button>
                            <button className="btn-export" onClick={() => exportReport(m.text, 'csv')}>📈 Excel</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="msg-text">{m.text}</div>
                    )}
                    <div className="msg-time">{m.time?.toLocaleTimeString()}</div>
                  </div>
                ))}

                {loading && (
                  <div className="msg assistant loading-msg">
                    <div className="loading-dots">
                      <span /><span /><span />
                    </div>
                    <span className="loading-text">Analyzing…</span>
                  </div>
                )}
                <div ref={chatEnd} />
              </div>

              <div className="chat-input-wrap">
                {files.length > 0 && (
                  <div className="input-files">
                    {files.map((f, i) => (
                      <span key={i} className="file-chip">📎 {f.name}
                        <span className="file-remove" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}>✕</span>
                      </span>
                    ))}
                  </div>
                )}
                <div className="input-row">
                  <textarea className="chat-textarea" value={input} onChange={e => setInput(e.target.value)}
                    placeholder="Ask the HR AI assistant anything…" rows={1}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
                  <button className="btn btn-gold" onClick={send} disabled={loading}>Send ▸</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ DOCUMENTS ══════════════════ */}
        {tab === 'docs' && (
          <div className="fade-wrapper visible">
            <section className="hero-card" style={{ marginBottom: 24 }}>
              <div className="hero-content">
                <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Sample Legal Documents</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                  Download these templates to test the platform. Upload them into the AI Agent for review, triage, and analysis.
                </p>
              </div>
            </section>

            <div className="doc-layout">
              <div className="doc-sidebar">
                <div className="sidebar-title">AVAILABLE SAMPLES</div>
                {SAMPLE_DOCS.map((doc, i) => (
                  <div key={i} className={`doc-item ${docIdx === i ? 'active' : ''}`} onClick={() => setDocIdx(i)}>
                    <div className="doc-item-name">{doc.name}</div>
                    <span className={`badge badge-${doc.type}`}>{doc.type}</span>
                  </div>
                ))}
              </div>
              <div className="doc-main">
                <div className="doc-header">
                  <div className="doc-title">{SAMPLE_DOCS[docIdx].name}</div>
                  <div className="doc-actions">
                    <button className="btn btn-gold" onClick={() => {
                      const d = SAMPLE_DOCS[docIdx];
                      downloadBlob(new Blob([d.content], { type: 'text/plain' }), d.filename);
                    }}>⬇ Download</button>
                    <button className="btn btn-ghost" onClick={() => {
                      setTab('agent');
                      setInput(`Analyze this "${SAMPLE_DOCS[docIdx].name}" document and provide a detailed legal review.`);
                    }}>🤖 Analyze with AI</button>
                  </div>
                </div>
                <pre className="doc-preview">{SAMPLE_DOCS[docIdx].content}</pre>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ USER GUIDE ══════════════════ */}
        {tab === 'guide' && (
          <div className="fade-wrapper visible">
            <section className="hero-card" style={{ marginBottom: 24 }}>
              <div className="hero-content">
                <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>📖 User Guide</h2>
                <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>
                  Welcome to PeopleOps AI — your HR team's AI-powered intelligence platform. This guide explains each component in plain language so every stakeholder — lawyers, paralegals, operations staff, and executives — can get the most out of the platform.
                </p>
              </div>
            </section>

            <div className="guide-grid">
              {/* Practice Areas */}
              <div className="guide-card">
                <div className="guide-card-header guide-header-1">
                  <span className="guide-card-icon">📜</span>
                  <h3>Practice Areas</h3>
                </div>
                <div className="guide-card-body">
                  <p className="guide-what"><strong>What is it?</strong></p>
                  <p>Practice Areas are the 12 legal domains the platform covers — think of them as departments in a law firm. Each practice area groups related AI capabilities together so you can find the right tool quickly.</p>
                  <p className="guide-what"><strong>The 12 Practice Areas:</strong></p>
                  <div className="guide-areas-list">
                    {PRACTICE_AREAS.map(a => (
                      <div key={a.id} className="guide-area-chip" style={{ borderColor: a.color }}>
                        <span>{a.icon}</span>
                        <div>
                          <strong>{a.name}</strong>
                          <span className="guide-area-desc">{a.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="guide-what"><strong>How to use:</strong></p>
                  <p>Click <strong>Practice Areas</strong> in the top menu → browse or search → click any area to see its skills → click <strong>Launch</strong> on a skill to use it with the AI Agent.</p>
                </div>
              </div>

              {/* AI Skills */}
              <div className="guide-card">
                <div className="guide-card-header guide-header-2">
                  <span className="guide-card-icon">⚡</span>
                  <h3>AI Skills</h3>
                </div>
                <div className="guide-card-body">
                  <p className="guide-what"><strong>What is it?</strong></p>
                  <p>AI Skills are specific, pre-built workflows that tell the AI exactly how to handle a particular type of legal task. Think of a skill as giving a new associate a detailed playbook — "when you get an NDA, check these 15 things in this order and flag these 8 red lines."</p>
                  <p className="guide-what"><strong>Examples:</strong></p>
                  <div className="guide-examples">
                    <div className="guide-example"><span className="guide-ex-icon">📝</span><div><strong>NDA Triager</strong><br/>Reads an inbound NDA and classifies it GREEN (auto-approve), YELLOW (minor issues), or RED (needs HR leadership review). Only the hard ones reach a lawyer's desk.</div></div>
                    <div className="guide-example"><span className="guide-ex-icon">🔍</span><div><strong>Vendor Agreement Review</strong><br/>Compares a vendor's contract against your approved playbook. Produces a redline memo showing where the vendor's terms deviate from your positions.</div></div>
                    <div className="guide-example"><span className="guide-ex-icon">📊</span><div><strong>Deposition Prep</strong><br/>Builds a deposition outline tied to your case theory, with supporting documents and impeachment material organized by topic.</div></div>
                    <div className="guide-example"><span className="guide-ex-icon">🔒</span><div><strong>DSAR Responder</strong><br/>Drafts Data Subject Access Request responses within regulatory timelines, searches across systems, and applies exemptions.</div></div>
                  </div>
                  <p className="guide-what"><strong>How to use:</strong></p>
                  <p>Select a skill from any Practice Area → it activates in the AI Agent sidebar → upload a document or describe your task → the AI applies that skill's methodology to produce structured, actionable output.</p>
                  <p>The platform has <strong>{totalSkills} skills</strong> across all practice areas. Each one is designed to save hours of routine legal work while maintaining quality and consistency.</p>
                </div>
              </div>

              {/* Managed Agents */}
              <div className="guide-card">
                <div className="guide-card-header guide-header-3">
                  <span className="guide-card-icon">🤖</span>
                  <h3>Managed Agents</h3>
                </div>
                <div className="guide-card-body">
                  <p className="guide-what"><strong>What is it?</strong></p>
                  <p>Managed Agents are autonomous AI workers that run in the background without human prompting. Unlike skills (which you activate manually), managed agents watch, monitor, and alert your team automatically — like having a tireless junior associate who never sleeps.</p>
                  <p className="guide-what"><strong>How they work:</strong></p>
                  <p>You configure a managed agent once (what to watch, how often, who to alert), and it runs on a schedule. When it finds something that needs attention, it delivers a structured report to your team.</p>
                  <p className="guide-what"><strong>The 5 Managed Agents:</strong></p>
                  <div className="guide-examples">
                    {MANAGED_AGENTS.map((ag, i) => (
                      <div key={i} className="guide-example"><span className="guide-ex-icon">⟐</span><div><strong>{ag.name}</strong><br/>{ag.desc}</div></div>
                    ))}
                  </div>
                  <p className="guide-what"><strong>Example in practice:</strong></p>
                  <p>The <strong>Renewal Watcher</strong> scans your 2,400 contracts every night. On Monday morning, your team gets a report: "3 contracts auto-renew this month — Contract A has a cancel-by date of March 15, Contract B needs a 60-day notice by March 1." No one had to remember to check.</p>
                </div>
              </div>

              {/* MCP Connections */}
              <div className="guide-card">
                <div className="guide-card-header guide-header-4">
                  <span className="guide-card-icon">🔌</span>
                  <h3>MCP Connections</h3>
                </div>
                <div className="guide-card-body">
                  <p className="guide-what"><strong>What is it?</strong></p>
                  <p>MCP (Model Context Protocol) Connections are integrations that let the AI agent talk directly to the software your HR team already uses. Instead of copy-pasting between systems, the AI can read from and write to your existing tools securely.</p>
                  <p className="guide-what"><strong>Why it matters:</strong></p>
                  <p>Without MCP, you'd upload a contract manually, wait for analysis, then manually copy the results into your CLM. With MCP, the AI pulls the contract from Ironclad, analyzes it, and posts the review memo back — all in one workflow.</p>
                  <p className="guide-what"><strong>Available Connections ({CONNECTORS.length}+):</strong></p>
                  <div className="guide-connectors-grid">
                    {CONNECTORS.map((c, i) => (
                      <span key={i} className="guide-connector-chip">{c}</span>
                    ))}
                  </div>
                  <p className="guide-what"><strong>Categories:</strong></p>
                  <div className="guide-examples">
                    <div className="guide-example"><span className="guide-ex-icon">📋</span><div><strong>Contract Lifecycle</strong><br/>Ironclad, DocuSign — pull contracts for review, push signed versions back</div></div>
                    <div className="guide-example"><span className="guide-ex-icon">📁</span><div><strong>Document Management</strong><br/>iManage, Box, Google Drive — search, retrieve, and file legal documents</div></div>
                    <div className="guide-example"><span className="guide-ex-icon">⚖️</span><div><strong>Litigation & Research</strong><br/>Everlaw, CourtListener, Trellis — monitor dockets, search case law, manage evidence</div></div>
                    <div className="guide-example"><span className="guide-ex-icon">📌</span><div><strong>Project Management</strong><br/>Slack, Jira, Linear, Asana — route legal requests, track matters, coordinate teams</div></div>
                  </div>
                  <p className="guide-what"><strong>Security:</strong></p>
                  <p>All MCP connections use encrypted HTTPS channels with authentication. Data flows through secure APIs — the AI never stores credentials, and every action is logged for audit purposes. Your IT security team can review all connection configurations.</p>
                </div>
              </div>

              {/* AI Agent */}
              <div className="guide-card">
                <div className="guide-card-header guide-header-5">
                  <span className="guide-card-icon">💬</span>
                  <h3>AI Agent</h3>
                </div>
                <div className="guide-card-body">
                  <p className="guide-what"><strong>What is it?</strong></p>
                  <p>The AI Agent is the core interface where you interact with Claude — Anthropic's most advanced AI model — to get legal work done. Upload a document, select a skill, and the AI produces a structured analysis with specific findings, wording recommendations, and action items.</p>
                  <p className="guide-what"><strong>What it produces:</strong></p>
                  <div className="guide-examples">
                    <div className="guide-example"><span className="guide-ex-icon">📊</span><div><strong>Structured Report Cards</strong><br/>Color-coded findings (🔴 High / 🟡 Medium / 🟢 Low) with numbered finding IDs, section references, current wording quotes, and recommended replacement language</div></div>
                    <div className="guide-example"><span className="guide-ex-icon">📥</span><div><strong>Downloadable Reports</strong><br/>Export as PDF (with title page + dashboard), Word (.doc), PowerPoint (.pptx), or Excel (.csv) — ready for stakeholder distribution</div></div>
                    <div className="guide-example"><span className="guide-ex-icon">📎</span><div><strong>Document Upload</strong><br/>Drag and drop Word documents (.docx), text files, CSVs, and more. The AI reads the full content and analyzes it immediately.</div></div>
                  </div>
                  <p className="guide-what"><strong>Access:</strong></p>
                  <p>The AI Agent requires an access code to use. Contact your legal operations team for the code. All other sections (Dashboard, Practice Areas, Documents, User Guide, Security) are freely accessible for browsing.</p>
                </div>
              </div>

              {/* Important Notes */}
              <div className="guide-card">
                <div className="guide-card-header guide-header-6">
                  <span className="guide-card-icon">⚠️</span>
                  <h3>Important Notes</h3>
                </div>
                <div className="guide-card-body">
                  <div className="guide-examples">
                    <div className="guide-example"><span className="guide-ex-icon">👨‍⚖️</span><div><strong>Human Review Required</strong><br/>Every output is a draft for HR leadership review. The AI accelerates legal work but does not replace professional judgment. A qualified attorney must review, verify, and approve all outputs before they are acted upon.</div></div>
                    <div className="guide-example"><span className="guide-ex-icon">🔒</span><div><strong>Privilege Awareness</strong><br/>The platform includes privilege safeguards — destination checks before output, matter-level isolation, and privilege-tagged document handling. However, users must ensure proper privilege protocols are followed.</div></div>
                    <div className="guide-example"><span className="guide-ex-icon">📋</span><div><strong>Audit Trail</strong><br/>All interactions are logged for compliance purposes. Export your sessions as needed for matter files.</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ SECURITY AUDIT ══════════════════ */}
        {tab === 'security' && (
          <div className="fade-wrapper visible">
            <section className="hero-card" style={{ marginBottom: 24 }}>
              <div className="hero-content">
                <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Security & Vulnerability Audit</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                  Comprehensive scan of the Claude for HR codebase — scripts, deployment manifests, MCP configurations, skill files, and agent orchestration patterns.
                </p>
                <div className="vuln-summary">
                  {[
                    { label: 'Passed', count: VULN_REPORT.filter(v => v.status === 'pass').length, color: 'var(--green)' },
                    { label: 'Warnings', count: VULN_REPORT.filter(v => v.status === 'warn').length, color: 'var(--orange)' },
                    { label: 'Critical', count: 0, color: 'var(--red)' },
                  ].map((s, i) => (
                    <div key={i} className="vuln-stat">
                      <span className="vuln-dot" style={{ background: s.color }} />
                      <span>{s.count} {s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="vuln-list">
              {VULN_REPORT.map((v, i) => (
                <div key={i} className={`vuln-item vuln-${v.severity}`}>
                  <div className="vuln-badges">
                    <span className={`badge badge-${v.status}`}>{v.status === 'pass' ? '✓ PASS' : '⚠ WARN'}</span>
                    <span className={`badge badge-sev-${v.severity}`}>{v.severity}</span>
                  </div>
                  <div className="vuln-title">{v.title}</div>
                  <div className="vuln-desc">{v.desc}</div>
                </div>
              ))}
            </div>

            <div className="assessment-box">
              <div className="assessment-title">Overall Assessment</div>
              <p className="assessment-text">
                The codebase demonstrates strong security practices: closed-schema intents prevent prompt injection escalation,
                input validation hardens shell scripts, YAML parsing uses safe_load exclusively, no hardcoded secrets were detected,
                and matter isolation maintains privilege boundaries. The three warnings are acknowledged by the authors and represent
                defense-in-depth gaps rather than critical vulnerabilities. Overall: production-ready with recommended hardening for
                audit log integrity and MCP TLS pinning.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>⚖ PeopleOps AI — HR Intelligence Platform</span>
          <span className="footer-divider">|</span>
          <span>Powered by Claude for HR</span>
          <span className="footer-divider">|</span>
          <a href="https://github.com/Arun-Cloudsec/peopleops-ai" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        </div>
      </footer>
    </div>
  );
}
