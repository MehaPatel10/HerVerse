const PDFDocument = require('pdfkit');

// Collects a pdfkit document's output stream into a single Buffer,
// so it can be either emailed as an attachment or piped straight to
// an HTTP response for direct download.
function renderToBuffer(buildFn) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    try {
      buildFn(doc);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function drawHeader(doc, subtitle) {
  doc
    .fillColor('#B23A63')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('HERVERSE', { continued: false });
  doc
    .fillColor('#8A6B76')
    .fontSize(9)
    .font('Helvetica')
    .text("AI-POWERED WOMEN'S HEALTH TRACKING", { characterSpacing: 0.6 });
  doc.moveDown(0.6);
  doc
    .fillColor('#3A2A30')
    .fontSize(15)
    .font('Helvetica-Bold')
    .text(subtitle);
  doc
    .strokeColor('#F0C7D6')
    .lineWidth(1)
    .moveTo(50, doc.y + 8)
    .lineTo(545, doc.y + 8)
    .stroke();
  doc.moveDown(1.4);
}

function keyValueRow(doc, label, value, opts = {}) {
  const y = doc.y;
  doc.fillColor('#8A6B76').fontSize(10).font('Helvetica').text(label, 50, y, { width: 200 });
  doc.fillColor('#3A2A30').fontSize(10).font(opts.bold ? 'Helvetica-Bold' : 'Helvetica').text(String(value), 250, y, { width: 295, align: 'right' });
  doc.moveDown(0.55);
}

function sectionTitle(doc, title) {
  doc.moveDown(0.4);
  doc.fillColor('#B23A63').fontSize(12).font('Helvetica-Bold').text(title);
  doc.moveDown(0.3);
  doc.strokeColor('#F0C7D6').lineWidth(0.75).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);
}

function footer(doc, note) {
  doc.moveDown(1.5);
  doc.strokeColor('#F0C7D6').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fillColor('#A98D96').fontSize(8.5).font('Helvetica').text(note || 'Generated automatically by HERVERSE. Not a substitute for professional medical advice.', { align: 'center' });
}

// ---------------------------------------------------------------------
// Invoice PDF
// ---------------------------------------------------------------------
function buildInvoicePdf({ invoiceNumber, dateStr, user, payment }) {
  return renderToBuffer((doc) => {
    drawHeader(doc, 'TAX INVOICE');

    keyValueRow(doc, 'Invoice Number', invoiceNumber, { bold: true });
    keyValueRow(doc, 'Invoice Date', dateStr);
    keyValueRow(doc, 'Payment Status', payment.status.toUpperCase());
    keyValueRow(doc, 'Payment Mode', payment.isDemo ? 'Demo / Test' : 'Razorpay');

    sectionTitle(doc, 'Billed To');
    keyValueRow(doc, 'Name', user.name || '-');
    keyValueRow(doc, 'Email', user.email || '-');
    keyValueRow(doc, 'Phone', user.phone || '-');
    keyValueRow(doc, 'Address', `${user.address || '-'}${user.pincode ? ' - ' + user.pincode : ''}`);

    sectionTitle(doc, 'Order Summary');

    const tableTop = doc.y;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#3A2A30');
    doc.text('Description', 50, tableTop, { width: 320 });
    doc.text('Amount (INR)', 370, tableTop, { width: 175, align: 'right' });
    doc.moveDown(0.4);
    doc.strokeColor('#E7C4D2').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.4);

    doc.font('Helvetica').fontSize(10).fillColor('#4A3A40');
    doc.text(payment.refLabel, 50, doc.y, { width: 320 });
    doc.text(`Rs. ${payment.amountINR}`, 370, doc.y - 12, { width: 175, align: 'right' });
    doc.moveDown(1);

    doc.strokeColor('#E7C4D2').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#B23A63');
    doc.text('Total Paid', 50, doc.y, { width: 320 });
    doc.text(`Rs. ${payment.amountINR}`, 370, doc.y - 14, { width: 175, align: 'right' });

    footer(doc, 'Thank you for choosing HERVERSE. This is a system-generated invoice and does not require a signature.');
  });
}

// ---------------------------------------------------------------------
// Day-wise health report PDF
// ---------------------------------------------------------------------
function buildDayReportPdf({ dateLabel, user, healthLog, foodLogs = [], periodPrediction = null }) {
  return renderToBuffer((doc) => {
    drawHeader(doc, `Daily Health Report — ${dateLabel}`);

    keyValueRow(doc, 'Name', user.name || '-');
    keyValueRow(doc, 'Report Date', dateLabel);

    sectionTitle(doc, 'Health Summary');
    if (healthLog) {
      keyValueRow(doc, 'Sleep', healthLog.sleepLogged ? `${Math.round((healthLog.sleepMinutes / 60) * 10) / 10} hrs` : 'Not logged');
      keyValueRow(doc, 'Steps', healthLog.steps || 0);
      keyValueRow(doc, 'Water intake', `${healthLog.waterLitres || 0} L`);
      keyValueRow(doc, 'Weight', healthLog.weightLogged ? `${healthLog.weightKg} kg` : 'Not logged');
    } else {
      doc.font('Helvetica').fontSize(10).fillColor('#4A3A40').text('No health tracker entries were logged for this day.');
      doc.moveDown(0.5);
    }

    sectionTitle(doc, 'Meals Logged');
    if (foodLogs.length) {
      let totalCal = 0;
      let totalProtein = 0;
      foodLogs.forEach((f) => {
        totalCal += f.calories || 0;
        totalProtein += f.protein || 0;
        keyValueRow(doc, `${f.meal}: ${f.name} x${f.qty}`, `${f.calories} kcal | ${Math.round((f.protein || 0) * 10) / 10} g protein`);
      });
      doc.moveDown(0.2);
      keyValueRow(doc, 'Total calories', `${totalCal} kcal`, { bold: true });
      keyValueRow(doc, 'Total protein', `${Math.round(totalProtein * 10) / 10} g`, { bold: true });
    } else {
      doc.font('Helvetica').fontSize(10).fillColor('#4A3A40').text('No meals were logged for this day.');
      doc.moveDown(0.5);
    }

    sectionTitle(doc, 'Period Tracker');
    if (periodPrediction) {
      keyValueRow(doc, 'Next period expected', new Date(periodPrediction.nextPeriod).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), { bold: true });
    } else {
      doc.font('Helvetica').fontSize(10).fillColor('#4A3A40').text('No period dates have been logged yet.');
    }

    footer(doc);
  });
}

module.exports = { renderToBuffer, buildInvoicePdf, buildDayReportPdf };
