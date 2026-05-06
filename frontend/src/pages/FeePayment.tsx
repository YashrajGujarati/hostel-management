import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Logo from '../components/Logo';

import API from '../apiConfig';
import { generateReceiptPDF } from '../utils/receiptGenerator';

const durations = [
  { months: 1, label: '1 Month', desc: 'Monthly' },
  { months: 2, label: '2 Months', desc: 'Bi-Monthly' },
  { months: 3, label: '3 Months', desc: 'Quarterly' },
  { months: 4, label: '4 Months', desc: 'Trimester' },
  { months: 6, label: '6 Months', desc: 'Half Year' },
  { months: 12, label: '12 Months', desc: 'Full Year' },
];

const paymentMethods = [
  { id: 'google_pay', name: 'Google Pay', icon: '📱' },
  { id: 'paytm', name: 'Paytm', icon: '💳' },
  { id: 'debit_card', name: 'Debit Card', icon: '🏦' },
  { id: 'credit_card', name: 'Credit Card', icon: '💎' },
];

const FeePayment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [bill, setBill] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState('');
  const [bills, setBills] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchData = async () => {
      try {
        if (user.roomId) {
          const rId = typeof user.roomId === 'object' ? user.roomId._id : user.roomId;
          const rRes = await axios.get(`${API}/rooms/${rId}`);
          setRoom(rRes.data);
        }
        const bRes = await axios.get(`${API}/bills`);
        setBills(bRes.data);
      } catch { }
      setLoading(false);
    };
    fetchData();
  }, [user, navigate]);

  const generateBill = async (durationOverride?: number) => {
    const durationToUse = durationOverride || selectedDuration;
    if (!durationToUse) return;
    setError('');
    try {
      const { data } = await axios.post(`${API}/bills/generate`, { duration: durationToUse });
      const enrichedBill = {
        ...data,
        studentName: user?.name || 'Student',
        roomNumber: room?.roomNumber || 'N/A',
        roomType: room?.type || 'Standard',
        totalAmount: data.amount || data.totalAmount || 0
      };
      setBill(enrichedBill);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate bill');
    }
  };

  const payBill = async () => {
    if (!bill || !selectedPayment) return;
    setPaying(true);
    setError('');
    try {
      const { data } = await axios.post(`${API}/bills/${bill._id}/pay`, { paymentMethod: selectedPayment });
      const enrichedReceipt = {
        ...data,
        studentName: data.studentName || user?.name || 'Student',
        roomNumber: data.roomNumber || room?.roomNumber || 'N/A',
        roomType: data.roomType || room?.type || 'Standard',
        totalAmount: data.amount || data.totalAmount || bill.totalAmount || 0
      };
      setReceipt(enrichedReceipt);
      setBill(null);
      const bRes = await axios.get(`${API}/bills`);
      setBills(bRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed');
    }
    setPaying(false);
  };

  const downloadPDF = async () => {
    if (!receipt) return;
    try {
      await generateReceiptPDF({
        id: receipt._id,
        studentName: receipt.studentName,
        roomNumber: receipt.roomNumber,
        roomType: receipt.roomType,
        amount: receipt.amount || receipt.totalAmount || 0,
        roomCharges: receipt.roomCharges || 0,
        foodCharges: receipt.foodCharges || 0,
        laundryCharges: receipt.laundryCharges || 0,
        gstAmount: receipt.gstAmount || 0,
        date: receipt.paidAt || new Date(),
        duration: receipt.durationLabel || 'Monthly',
        paymentMethod: receipt.paymentMethod || 'Online'
      });
    } catch (err) {
      console.error('Failed to generate PDF', err);
    }
  };

  if (loading) return <div className="loading min-h-screen pt-20"><div className="spinner"></div></div>;

  if (!room) {
    return (
      <div className="payment-page">
        <div className="empty-state pt-16">
          <div className="empty-state-icon">🏠</div>
          <h3>No Room Assigned</h3>
          <p className="mb-4">Please book a room first before paying fees.</p>
          <button className="btn btn-primary" onClick={() => navigate('/rooms')}>Browse Rooms</button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-header text-left">
          <div className="section-badge">💳 Fee Payment</div>
          <h2 className="section-title">Pay Hostel Fees</h2>
          <p className="section-subtitle m-0">
            Room {room.roomNumber} ({room.type}) — ₹{room.price.toLocaleString()}/month
          </p>
        </div>
      </motion.div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Receipt */}
      <AnimatePresence>
        {receipt && (
          <motion.div
            className="receipt"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="receipt-check">✅</div>
            <h2 className="text-2xl font-extrabold mb-2">Payment Successful!</h2>
            <p className="text-secondary mb-6">Your fee payment has been processed.</p>
            
            <div id="receipt-card" className="receipt-card">
              {/* Premium Background Accent */}
              <div className="receipt-accent"></div>
              
              {/* Header */}
              <div className="receipt-header">
                <div className="flex items-center gap-4">
                  <Logo size={55} />
                  <div>
                    <h2 className="text-2xl font-black text-[#111827] m-0 tracking-tight uppercase">Hostel Sphere</h2>
                    <p className="text-xs text-[#6b7280] m-0 font-medium">A Home Away from Home</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[0.75rem] text-[#9ca3af] font-semibold m-0">INVOICE #</p>
                  <p className="text-[0.85rem] text-[#111827] font-bold m-0">{receipt._id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>

              <div className="receipt-divider"></div>

              {/* Details and Stamp Container */}
              <div className="receipt-section">
                <div>
                  <p className="receipt-label-tiny">Billing To</p>
                  <h3 className="receipt-student-name">{receipt.studentName}</h3>
                  <div className="flex gap-2.5 mt-1.5">
                    <span className="receipt-tag">Room {receipt.roomNumber}</span>
                    <span className="receipt-tag">{receipt.roomType}</span>
                  </div>
                  <p className="text-sm text-[#6b7280] mt-2.5">Date of Issue: <strong>{new Date(receipt.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></p>
                </div>

                {/* Professional PAID Rubber Stamp */}
                <div className="receipt-stamp">
                  <span>PAID</span>
                  <span className="text-[0.7rem]">{new Date(receipt.paidAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="receipt-table-container">
                <div className="receipt-table-header">
                  <span>Fee Description</span>
                  <span>Subtotal</span>
                </div>
                <div className="receipt-table-row">
                  <span className="text-[#4b5563] font-medium">Room Accommodation <span className="text-[0.75rem] text-[#9ca3af]">({receipt.durationLabel})</span></span>
                  <span className="font-bold text-[#111827]">₹{receipt.roomCharges?.toLocaleString()}</span>
                </div>
                <div className="receipt-table-row">
                  <span className="text-[#4b5563] font-medium">Dining & Meal Services</span>
                  <span className="font-bold text-[#111827]">₹{receipt.foodCharges?.toLocaleString()}</span>
                </div>
                <div className="receipt-table-row">
                  <span className="text-[#4b5563] font-medium">Laundry & Facility Maintenance</span>
                  <span className="font-bold text-[#111827]">₹{receipt.laundryCharges?.toLocaleString()}</span>
                </div>
                {receipt.gstAmount !== undefined && (
                  <div className="flex-between p-3.5 bg-[#f9fafb] text-sm">
                    <span className="text-[#6b7280] text-xs">Applicable GST (18%)</span>
                    <span className="font-semibold text-[#6b7280]">₹{receipt.gstAmount?.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Total Card */}
              <div className="receipt-total-box">
                <div>
                  <p className="text-sm text-[#9ca3af] m-0 font-medium">Net Payable Amount</p>
                  <p className="text-[0.75rem] text-[#6b7280] mt-1 m-0">via {receipt.paymentMethod?.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white">₹{receipt.totalAmount?.toLocaleString()}</div>
                  <p className="text-[0.65rem] text-[#10b981] mt-1 m-0 font-bold">● TRANSACTION SUCCESSFUL</p>
                </div>
              </div>

              {/* Footer Details */}
              <div className="receipt-footer">
                <p className="text-[0.7rem] text-[#9ca3af] m-0">Reference ID: {receipt._id}</p>
                <div className="mt-4">
                  <p className="text-[0.85rem] font-bold text-[#111827] m-0">Hostel Sphere Management System</p>
                  <p className="text-[0.7rem] text-[#9ca3af] mt-1">This is a computer-generated receipt and doesn't require a physical signature.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6 flex-center">
              <button className="btn btn-secondary" onClick={() => setReceipt(null)}>Pay Another</button>
              <button className="btn btn-primary" onClick={downloadPDF}>📄 Download PDF</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!receipt && (
        <>
          {/* Duration Selection */}
          {!bill && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h3 className="mb-4 text-lg font-bold">Select Duration</h3>
              <div className="duration-options">
                {durations.map(d => (
                  <div
                    key={d.months}
                    className={`duration-option ${selectedDuration === d.months ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedDuration(d.months);
                      generateBill(d.months);
                    }}
                  >
                    <h4>{d.label}</h4>
                    <p>{d.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bill Preview */}
          {bill && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bill-preview p-8 rounded-2xl">
                <div className="bill-header border-b-glass pb-5 mb-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Logo size={35} />
                    <h2 className="text-xl font-extrabold">Hostel Sphere — Fee Invoice</h2>
                  </div>
                  <p className="text-muted text-sm">
                    Auto-generated bill for {bill.studentName}
                  </p>
                </div>
                <div className="bill-row"><span className="label">Room</span><span className="value">Room {bill.roomNumber} ({bill.roomType})</span></div>
                <div className="bill-row"><span className="label">Duration</span><span className="value">{bill.durationLabel}</span></div>
                <div className="bill-row"><span className="label">Room Charges</span><span className="value">₹{bill.roomCharges.toLocaleString()}</span></div>
                <div className="bill-row"><span className="label">Food Charges</span><span className="value">₹{bill.foodCharges.toLocaleString()}</span></div>
                <div className="bill-row"><span className="label">Laundry Charges</span><span className="value">₹{bill.laundryCharges.toLocaleString()}</span></div>
                {bill.gstAmount !== undefined && <div className="bill-row"><span className="label">GST (18%)</span><span className="value">₹{bill.gstAmount.toLocaleString()}</span></div>}
                <div className="bill-row total mt-4 pt-4 border-t-2 border-glass">
                  <span className="label">Total Amount</span>
                  <span className="value text-2xl text-cyan">₹{bill.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <h3 className="mb-4 text-lg font-bold">Choose Payment Method</h3>
              <div className="payment-methods">
                {paymentMethods.map(pm => (
                  <div
                    key={pm.id}
                    className={`payment-method ${selectedPayment === pm.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPayment(pm.id)}
                  >
                    <span className="payment-method-icon">{pm.icon}</span>
                    <h4>{pm.name}</h4>
                  </div>
                ))}
              </div>

              {/* QR Code Popup */}
              <AnimatePresence>
                {showQR && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="modal-overlay fixed inset-0 bg-black-85 backdrop-blur-sm z-3000 flex-center"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      className="qr-modal modal-qr"
                    >
                      <div className="close-modal" onClick={() => setShowQR(false)}>✕</div>
                      <h3 className="mb-2.5 text-1.4rem font-extrabold">Scan to Pay</h3>
                      <p className="text-[#6b7280] text-[0.85rem] mb-6">
                        Scan this QR code using your {paymentMethods.find(p => p.id === selectedPayment)?.name} app to pay ₹{(bill.totalAmount || 0).toLocaleString()}
                      </p>
                      
                      <div className="qr-container">
                        {/* Mock QR Code */}
                        <div className="qr-box">
                           <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=hostelsphere@upi&pn=HostelSphere&am=1.00" alt="QR Code" className="w-full h-full" />
                           <div className="qr-logo">
                              <Logo size={30} />
                           </div>
                        </div>
                      </div>

                      <div className="text-sm text-[#111827] font-bold mb-1.5">
                        UPI ID: hostelsphere@upi
                      </div>
                      <p className="text-[0.75rem] text-[#9ca3af] mb-6">Remaining time: 04:59</p>

                      <button 
                        className="btn btn-emerald btn-lg w-full rounded-xl"
                        onClick={() => {
                          setShowQR(false);
                          payBill();
                        }}
                      >
                        I have paid ₹{(bill.totalAmount || 0).toLocaleString()}
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4 mt-8">
                <button className="btn btn-secondary" onClick={() => setBill(null)}>← Back</button>
                {(selectedPayment === 'google_pay' || selectedPayment === 'paytm') && (
                  <button
                    className="btn btn-outline btn-sm font-bold"
                    onClick={() => setShowQR(true)}
                  >
                    📱 Scan QR Code
                  </button>
                )}
                <button
                  className="btn btn-emerald btn-lg flex-1 font-extrabold tracking-wide shadow-emerald"
                  disabled={!selectedPayment || paying}
                  onClick={payBill}
                >
                  {paying ? (
                    <div className="flex items-center justify-center gap-2.5">
                      <div className="spinner w-5 h-5 border-t-white"></div>
                      Processing...
                    </div>
                  ) : (
                    `Complete Secure Payment — ₹${bill.totalAmount.toLocaleString()}`
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* PAYMENT PROCESSING OVERLAY */}
          <AnimatePresence>
            {paying && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black-80 backdrop-blur-md z-2000 flex-center"
              >
                <div className="text-center">
                  <div className="spinner w-80 h-80 mx-auto mb-8"></div>
                  <h2 className="text-white font-extrabold mb-2">Securing Transaction</h2>
                  <p className="text-muted">Confirming payment with your provider...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Payment History */}
      {bills.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12">
          <div className="flex flex-between items-center mb-4">
            <h3 className="text-1.1rem font-bold">Payment History</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? 'Hide' : 'Show'}
            </button>
          </div>
          {showHistory && (
            <div className="complaints-list">
              {bills.map(b => (
                <div key={b._id} className="complaint-card">
                  <div className="complaint-header">
                    <span className={`complaint-status ${b.status === 'Paid' ? 'Resolved' : 'Pending'}`}>
                      {b.status}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(b.createdAt || Date.now()).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="complaint-subject">₹{(b.amount || b.totalAmount || 0).toLocaleString()} — {b.durationLabel}</div>
                  <div className="complaint-description flex flex-between items-center">
                    <span>Room {room?.roomNumber || 'N/A'} ({room?.type || 'Standard'}) • {b.paymentMethod ? b.paymentMethod.replace('_', ' ').toUpperCase() : 'Not paid'}</span>
                    
                    {b.status === 'Paid' && (
                      <button 
                        className="btn btn-secondary btn-sm px-3 py-1.5 text-xs font-semibold"
                        onClick={() => {
                          import('../utils/receiptGenerator').then(m => {
                            m.generateReceiptPDF({
                              id: b._id,
                              studentName: user?.name || 'Student',
                              roomNumber: room?.roomNumber || 'N/A',
                              roomType: room?.type || 'Standard',
                              amount: b.amount || b.totalAmount || 0,
                              roomCharges: b.roomCharges || 0,
                              foodCharges: b.foodCharges || 0,
                              laundryCharges: b.laundryCharges || 0,
                              gstAmount: b.gstAmount || 0,
                              date: b.paidDate || b.createdAt || new Date(),
                              duration: b.durationLabel || 'Monthly',
                              paymentMethod: b.paymentMethod || 'Online'
                            });
                          });
                        }}
                      >
                        📄 Download Receipt
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default FeePayment;
