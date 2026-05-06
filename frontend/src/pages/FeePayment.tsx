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

  if (loading) return <div className="loading" style={{ minHeight: '100vh', paddingTop: '5rem' }}><div className="spinner"></div></div>;

  if (!room) {
    return (
      <div className="payment-page">
        <div className="empty-state" style={{ paddingTop: '4rem' }}>
          <div className="empty-state-icon">🏠</div>
          <h3>No Room Assigned</h3>
          <p style={{ marginBottom: '1rem' }}>Please book a room first before paying fees.</p>
          <button className="btn btn-primary" onClick={() => navigate('/rooms')}>Browse Rooms</button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-header" style={{ textAlign: 'left' }}>
          <div className="section-badge">💳 Fee Payment</div>
          <h2 className="section-title">Pay Hostel Fees</h2>
          <p className="section-subtitle" style={{ margin: 0 }}>
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Payment Successful!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your fee payment has been processed.</p>
            
            <div id="receipt-card" style={{ 
              padding: '40px', 
              background: '#ffffff', 
              borderRadius: '16px', 
              color: '#1f2937',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              maxWidth: '500px',
              margin: '0 auto',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: 'Inter, sans-serif'
            }}>
              {/* Premium Background Accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'linear-gradient(90deg, #0ea5e9, #10b981)' }}></div>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <Logo size={55} />
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Hostel Sphere</h2>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, fontWeight: 500 }}>A Home Away from Home</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, margin: 0 }}>INVOICE #</p>
                  <p style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 700, margin: 0 }}>{receipt._id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>

              <div style={{ borderBottom: '2px solid #f3f4f6', marginBottom: '25px' }}></div>

              {/* Details and Stamp Container */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', position: 'relative' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '8px' }}>Billing To</p>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>{receipt.studentName}</h3>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <span style={{ background: '#f3f4f6', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>Room {receipt.roomNumber}</span>
                    <span style={{ background: '#f3f4f6', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{receipt.roomType}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '10px' }}>Date of Issue: <strong>{new Date(receipt.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></p>
                </div>

                {/* Professional PAID Rubber Stamp */}
                <div style={{ 
                  transform: 'rotate(-20deg)', 
                  border: '5px double #ef4444', 
                    color: '#ef4444', 
                  padding: '5px 15px', 
                  borderRadius: '10px', 
                  fontSize: '1.8rem', 
                    fontWeight: 900,
                  opacity: 0.8,
                    userSelect: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(239, 68, 68, 0.05)',
                  boxShadow: '0 0 0 2px #ef4444 inset'
                }}>
                  <span>PAID</span>
                  <span style={{ fontSize: '0.7rem' }}>{new Date(receipt.paidAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginBottom: '30px', background: '#fcfcfc', borderRadius: '12px', border: '1px solid #f1f1f1', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', background: '#f9fafb', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>
                  <span>Fee Description</span>
                  <span>Subtotal</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #f3f4f6', fontSize: '0.95rem' }}>
                  <span style={{ color: '#4b5563', fontWeight: 500 }}>Room Accommodation <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>({receipt.durationLabel})</span></span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>₹{receipt.roomCharges?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #f3f4f6', fontSize: '0.95rem' }}>
                  <span style={{ color: '#4b5563', fontWeight: 500 }}>Dining & Meal Services</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>₹{receipt.foodCharges?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #f3f4f6', fontSize: '0.95rem' }}>
                  <span style={{ color: '#4b5563', fontWeight: 500 }}>Laundry & Facility Maintenance</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>₹{receipt.laundryCharges?.toLocaleString()}</span>
                </div>
                {receipt.gstAmount !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', background: '#f9fafb', fontSize: '0.9rem' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Applicable GST (18%)</span>
                    <span style={{ fontWeight: 600, color: '#6b7280' }}>₹{receipt.gstAmount?.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Total Card */}
              <div style={{ 
                background: 'linear-gradient(135deg, #111827, #1f2937)', 
                borderRadius: '12px', 
                padding: '25px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                color: 'white',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0, fontWeight: 500 }}>Net Payable Amount</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '4px 0 0 0' }}>via {receipt.paymentMethod?.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>₹{receipt.totalAmount?.toLocaleString()}</div>
                  <p style={{ fontSize: '0.65rem', color: '#10b981', margin: '4px 0 0 0', fontWeight: 700 }}>● TRANSACTION SUCCESSFUL</p>
                </div>
              </div>

              {/* Footer Details */}
              <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>Reference ID: {receipt._id}</p>
                <div style={{ marginTop: '15px' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', margin: 0 }}>Hostel Sphere Management System</p>
                  <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>This is a computer-generated receipt and doesn't require a physical signature.</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
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
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>Select Duration</h3>
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
              <div className="bill-preview" style={{ padding: '30px', borderRadius: '16px' }}>
                <div className="bill-header" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <Logo size={35} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Hostel Sphere — Fee Invoice</h2>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Auto-generated bill for {bill.studentName}
                  </p>
                </div>
                <div className="bill-row"><span className="label">Room</span><span className="value">Room {bill.roomNumber} ({bill.roomType})</span></div>
                <div className="bill-row"><span className="label">Duration</span><span className="value">{bill.durationLabel}</span></div>
                <div className="bill-row"><span className="label">Room Charges</span><span className="value">₹{bill.roomCharges.toLocaleString()}</span></div>
                <div className="bill-row"><span className="label">Food Charges</span><span className="value">₹{bill.foodCharges.toLocaleString()}</span></div>
                <div className="bill-row"><span className="label">Laundry Charges</span><span className="value">₹{bill.laundryCharges.toLocaleString()}</span></div>
                {bill.gstAmount !== undefined && <div className="bill-row"><span className="label">GST (18%)</span><span className="value">₹{bill.gstAmount.toLocaleString()}</span></div>}
                <div className="bill-row total" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px solid var(--border-glass)' }}>
                  <span className="label">Total Amount</span>
                  <span className="value" style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)' }}>₹{bill.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>Choose Payment Method</h3>
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
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ 
                      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                      zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <motion.div 
                      className="qr-modal"
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      style={{ 
                        background: 'white', padding: '40px', borderRadius: '24px', 
                        textAlign: 'center', color: '#111827', maxWidth: '400px', width: '90%' 
                      }}
                    >
                      <div style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => setShowQR(false)}>✕</div>
                      <h3 style={{ marginBottom: '10px', fontSize: '1.4rem', fontWeight: 800 }}>Scan to Pay</h3>
                      <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '25px' }}>
                        Scan this QR code using your {paymentMethods.find(p => p.id === selectedPayment)?.name} app to pay ₹{(bill.totalAmount || 0).toLocaleString()}
                      </p>
                      
                      <div style={{ 
                        background: '#f9fafb', padding: '20px', borderRadius: '16px', 
                        display: 'flex', justifyContent: 'center', marginBottom: '25px',
                        border: '1px solid #f3f4f6'
                      }}>
                        {/* Mock QR Code */}
                        <div style={{ width: '200px', height: '200px', background: 'white', padding: '10px', borderRadius: '12px', border: '2px solid #111827', position: 'relative' }}>
                           <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=hostelsphere@upi&pn=HostelSphere&am=1.00" alt="QR Code" style={{ width: '100%', height: '100%' }} />
                           <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '5px', borderRadius: '4px' }}>
                              <Logo size={30} />
                           </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.9rem', color: '#111827', fontWeight: 700, marginBottom: '5px' }}>
                        UPI ID: hostelsphere@upi
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '25px' }}>Remaining time: 04:59</p>

                      <button 
                        className="btn btn-emerald btn-lg" 
                        style={{ width: '100%', borderRadius: '12px' }}
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

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={() => setBill(null)}>← Back</button>
                {(selectedPayment === 'google_pay' || selectedPayment === 'paytm') && (
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ fontWeight: 700 }}
                    onClick={() => setShowQR(true)}
                  >
                    📱 Scan QR Code
                  </button>
                )}
                <button
                  className="btn btn-emerald btn-lg"
                  style={{ flex: 1, fontWeight: 800, letterSpacing: '0.02em', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)' }}
                  disabled={!selectedPayment || paying}
                  onClick={payBill}
                >
                  {paying ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: 'white' }}></div>
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
                style={{ 
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                  background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                  zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div className="spinner" style={{ width: '80px', height: '80px', margin: '0 auto 2rem' }}></div>
                  <h2 style={{ color: 'white', fontWeight: 800, marginBottom: '0.5rem' }}>Securing Transaction</h2>
                  <p style={{ color: 'var(--text-muted)' }}>Confirming payment with your provider...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Payment History */}
      {bills.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Payment History</h3>
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
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(b.createdAt || Date.now()).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="complaint-subject">₹{(b.amount || b.totalAmount || 0).toLocaleString()} — {b.durationLabel}</div>
                  <div className="complaint-description" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Room {room?.roomNumber || 'N/A'} ({room?.type || 'Standard'}) • {b.paymentMethod ? b.paymentMethod.replace('_', ' ').toUpperCase() : 'Not paid'}</span>
                    
                    {b.status === 'Paid' && (
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600 }}
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
