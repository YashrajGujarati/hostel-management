import jsPDF from 'jspdf';

export const generateReceiptPDF = async (receiptData: {
  id: string,
  studentName: string,
  roomNumber: string,
  roomType: string,
  amount: number,
  roomCharges: number,
  foodCharges: number,
  laundryCharges: number,
  gstAmount: number,
  date: string,
  duration: string,
  paymentMethod: string
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Colors
  const primaryColor = [17, 24, 39]; // #111827
  const accentColor = [14, 165, 233]; // #0ea5e9
  const stampColor = [239, 68, 68]; // #ef4444

  // Top Accent Bar
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 0, 210, 5, 'F');

  // Header with Logo
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.circle(28, 26, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('H', 28, 28, { align: 'center' });

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('HOSTEL SPHERE', 40, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('A Home Away from Home', 40, 32);

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE #', 190, 20, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(receiptData.id.substring(0, 8).toUpperCase(), 190, 25, { align: 'right' });

  // Divider
  doc.setDrawColor(241, 245, 249);
  doc.line(20, 40, 190, 40);

  // Billing Details
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', 20, 55);

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(14);
  doc.text(receiptData.studentName, 20, 65);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Room ${receiptData.roomNumber} (${receiptData.roomType})`, 20, 72);
  doc.text(`Date: ${new Date(receiptData.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, 20, 79);

  // AUTHENTIC PAID STAMP (Circular)
  const stampX = 165;
  const stampY = 65;
  
  doc.setDrawColor(stampColor[0], stampColor[1], stampColor[2]);
  doc.setLineWidth(1);
  doc.circle(stampX, stampY, 15, 'S'); // Outer circle
  doc.setLineWidth(0.5);
  doc.circle(stampX, stampY, 13, 'S'); // Inner circle
  
  doc.setTextColor(stampColor[0], stampColor[1], stampColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PAID', stampX, stampY + 1, { align: 'center', angle: -15 });
  
  doc.setFontSize(6);
  doc.text(new Date(receiptData.date).toLocaleDateString(), stampX, stampY + 5, { align: 'center', angle: -15 });
  doc.text('HOSTEL SPHERE', stampX, stampY - 3, { align: 'center', angle: -15 });

  // Fees Table
  let y = 100;
  doc.setFillColor(248, 250, 252);
  doc.rect(20, y, 170, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text('FEE DESCRIPTION', 25, y + 7);
  doc.text('SUBTOTAL', 185, y + 7, { align: 'right' });

  y += 10;
  const addItem = (label: string, value: number) => {
    y += 15;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.text(label, 25, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`INR ${value.toLocaleString()}`, 185, y, { align: 'right' });
    doc.setDrawColor(241, 245, 249);
    doc.line(20, y + 5, 190, y + 5);
  };

  addItem(`Room Accommodation (${receiptData.duration})`, receiptData.roomCharges);
  addItem('Dining & Meal Services', receiptData.foodCharges);
  addItem('Laundry & Facility Maintenance', receiptData.laundryCharges);
  addItem('Applicable GST (18%)', receiptData.gstAmount);

  // Total
  y += 25;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(20, y, 170, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('NET PAYABLE AMOUNT', 30, y + 10);
  doc.setFontSize(8);
  doc.text(`via ${receiptData.paymentMethod.replace('_', ' ').toUpperCase()}`, 30, y + 17);
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`INR ${receiptData.amount.toLocaleString()}`, 180, y + 16, { align: 'right' });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Reference ID: ${receiptData.id}`, 105, 260, { align: 'center' });
  doc.text('Hostel Sphere Management System', 105, 275, { align: 'center' });
  doc.text('This is a computer-generated receipt and doesn\'t require a physical signature.', 105, 280, { align: 'center' });

  // Save
  doc.save(`Hostel_Receipt_${receiptData.id.substring(0, 8)}.pdf`);
};
