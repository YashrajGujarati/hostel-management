import jsPDF from 'jspdf';

export const generateReceiptPDF = async (receiptData: {
  id: string,
  studentName: string,
  roomNumber: string,
  amount: number,
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
  const primaryColor = [14, 165, 233]; // #0ea5e9
  const secondaryColor = [71, 85, 105]; // #475569

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('HOSTEL SPHERE', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Payment Receipt', 105, 30, { align: 'center' });

  // Receipt Info
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(10);
  doc.text(`Receipt No: ${receiptData.id}`, 20, 55);
  doc.text(`Date: ${new Date(receiptData.date).toLocaleDateString()}`, 150, 55);

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 60, 190, 60);

  // Student Details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 20, 75);
  
  doc.setFont('helvetica', 'normal');
  doc.text(receiptData.studentName, 20, 83);
  doc.text(`Room: ${receiptData.roomNumber}`, 20, 90);

  // Table Header
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 105, 170, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 25, 112);
  doc.text('Duration', 90, 112);
  doc.text('Amount', 160, 112);

  // Table Body
  doc.setFont('helvetica', 'normal');
  doc.text('Hostel Accommodation Fee', 25, 125);
  doc.text(receiptData.duration, 90, 125);
  doc.text(`INR ${receiptData.amount.toLocaleString()}`, 160, 125);

  // Divider
  doc.line(20, 140, 190, 140);

  // Total
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT PAID:', 110, 155);
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`INR ${receiptData.amount.toLocaleString()}`, 160, 155, { align: 'left' });

  // Payment Method
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'italic');
  doc.text(`Payment Method: ${receiptData.paymentMethod.replace('_', ' ').toUpperCase()}`, 20, 155);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer generated receipt and does not require a signature.', 105, 280, { align: 'center' });
  doc.text('Thank you for choosing Hostel Sphere!', 105, 285, { align: 'center' });

  // Save
  doc.save(`Receipt_${receiptData.id}.pdf`);
};
