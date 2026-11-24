const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, ImageRun, AlignmentType, VerticalAlign, LevelFormat, TabStopType } = require('docx');
const D = JSON.parse(fs.readFileSync(__dirname + '/content.json', 'utf8'));

const INK = '0D1117', BODY = '2A2F37', MUTED = '5B6472', GREEN = '0F7A54', MINT = '7BE0B8', DARK = '0B0F17', SIDE = 'F3F6F9';
const H = 'Space Grotesk', B = 'Inter';
const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noB = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
const W = 12240, M = 0; // full-bleed table, margins handled in cells
const SIDE_W = 3100, MAIN_W = W - SIDE_W;

const t = (text, o = {}) => new TextRun({ text, font: o.font || B, size: o.size || 19, bold: o.bold, color: o.color || BODY, characterSpacing: o.sp });
const p = (runs, o = {}) => new Paragraph({ children: Array.isArray(runs) ? runs : [runs], spacing: o.noLine ? { before: 0, after: o.after ?? 60 } : { before: o.before || 0, after: o.after ?? 60, line: o.line || 276 }, alignment: o.align, numbering: o.numbering, border: o.border, tabStops: o.tabs });
const head = (text) => p(t(text.toUpperCase(), { font: H, size: 17, bold: true, color: GREEN, sp: 40 }), { before: 200, after: 100, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CFE5DB', space: 3 } } });

// header band
const header = new Table({
  width: { size: W, type: WidthType.DXA }, columnWidths: [W - 2600, 2600], borders: noB,
  rows: [new TableRow({ children: [
    new TableCell({ borders: { top: none, bottom: none, left: none, right: { style: BorderStyle.SINGLE, size: 4, color: DARK } }, width: { size: W - 2600, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: DARK, color: 'auto' }, margins: { top: 500, bottom: 360, left: 720, right: 200 }, verticalAlign: VerticalAlign.CENTER, children: [
      p(t(D.name, { font: H, size: 60, bold: true, color: 'FFFFFF' }), { after: 80, line: 240 }),
      p(t(D.role, { font: H, size: 23, color: MINT }), { after: 160 }),
      p(D.contact.flatMap((c, i) => [...(i ? [t('   •   ', { color: '22C58B', size: 18 })] : []), t(c, { color: 'C9D1DC', size: 17 })]), { after: 0 }),
    ] }),
    new TableCell({ borders: { top: none, bottom: none, left: { style: BorderStyle.SINGLE, size: 4, color: DARK }, right: none }, width: { size: 2600, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: DARK, color: 'auto' }, margins: { top: 360, bottom: 300, left: 100, right: 600 }, verticalAlign: VerticalAlign.TOP, children: [
      p(new ImageRun({ type: 'png', data: fs.readFileSync(__dirname + '/qr.png'), transformation: { width: 92, height: 92 } }), { align: AlignmentType.CENTER, after: 60, noLine: true }),
      p(t('Talk to my AI résumé', { font: H, size: 18, bold: true, color: MINT }), { align: AlignmentType.CENTER, after: 0 }),
      p(t('Scan to ask Ryan anything, in any language.', { size: 14, color: 'C9D1DC' }), { align: AlignmentType.CENTER, after: 0 }),
    ] }),
  ] })],
});
const bar = new Paragraph({ spacing: { before: 0, after: 0 }, border: { bottom: { style: BorderStyle.SINGLE, size: 24, color: '22C58B', space: 0 } }, children: [] });

// sidebar
const side = [
  head('Core Skills'),
  p(t(D.ai_label, { bold: true, color: INK, size: 17 }), { after: 60 }),
  p(t(D.ai_skills.join('  ·  '), { size: 16 }), { after: 140, line: 300 }),
  p(t(D.ops_label, { bold: true, color: INK, size: 17 }), { after: 60 }),
  p(t(D.ops_skills.join('  ·  '), { size: 16 }), { after: 120, line: 300 }),
  head('Education'),
  ...D.education.flatMap(x => [p(t(x.name, { bold: true, color: INK, size: 17 }), { after: 20 }), p(t(x.detail, { size: 16, color: MUTED }), { after: 140 })]),
];

// main
const main = [head('Summary'), p(t(D.summary, { size: 19 }), { after: 80, line: 300 }), head('Experience')];
for (const j of D.jobs) {
  main.push(p([t(j.title, { font: H, size: 21, bold: true, color: INK }), new TextRun({ text: '\t' }), t(j.dates, { size: 16, bold: true, color: GREEN })], { before: 140, after: 10, tabs: [{ type: TabStopType.RIGHT, position: MAIN_W - 900 }] }));
  main.push(p(t(j.org, { size: 17, color: MUTED }), { after: 50 }));
  for (const b of j.bullets) main.push(p(t(b, { size: 18 }), { after: 30, numbering: { reference: 'dots', level: 0 } }));
}

const body = new Table({
  width: { size: W, type: WidthType.DXA }, columnWidths: [SIDE_W, MAIN_W], borders: noB,
  rows: [new TableRow({ children: [
    new TableCell({ width: { size: SIDE_W, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: SIDE, color: 'auto' }, margins: { top: 200, bottom: 300, left: 560, right: 280 }, borders: { right: { style: BorderStyle.SINGLE, size: 4, color: 'E3E8EE' }, top: none, bottom: none, left: none }, children: side }),
    new TableCell({ borders: { top: none, bottom: none, left: none, right: none }, width: { size: MAIN_W, type: WidthType.DXA }, margins: { top: 200, bottom: 300, left: 400, right: 640 }, children: main }),
  ] })],
});

const doc = new Document({
  creator: 'Jason Bourbeau', title: 'Jason Bourbeau Resume',
  styles: { default: { document: { run: { font: B, size: 19, color: BODY } } } },
  numbering: { config: [{ reference: 'dots', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { run: { color: '3878FF' }, paragraph: { indent: { left: 260, hanging: 200 } } } }] }] },
  sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 0, bottom: 500, left: 0, right: 0, header: 0 } } }, children: [header, bar, body] }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(__dirname + '/resume.docx', b); console.log('docx written'); });
