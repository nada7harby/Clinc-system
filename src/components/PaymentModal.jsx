import { useState, useEffect } from "react";
import { Modal, Button, Icon, Input, Badge } from "@/components";
import { useUpdatePayment } from "@/hooks/useAppointments";
import { PAYMENT_STATUS, PAYMENT_METHOD } from "@/constants/appConstants";
import toast from "react-hot-toast";

export default function PaymentModal({ isOpen, onClose, appointment }) {
  const { mutate: updatePayment, isLoading: isUpdating } = useUpdatePayment();
  const [method, setMethod] = useState(PAYMENT_METHOD.CASH);
  
  // Cash calculations
  const [cashTendered, setCashTendered] = useState("");
  const [changeDue, setChangeDue] = useState(0);

  // POS State
  const [posState, setPosState] = useState("idle"); // idle, connecting, sending, swiping, processing, approved
  const [posTerminalLog, setPosTerminalLog] = useState("");

  // Wallet State
  const [walletBalance, setWalletBalance] = useState(150); // Simulated patient wallet balance
  const [walletSuccess, setWalletSuccess] = useState(false);

  // Derive price & due
  const totalAmount = appointment?.price || 0;
  const alreadyPaid = appointment?.paidAmount || 0;
  const remainingDue = Math.max(0, totalAmount - alreadyPaid);

  useEffect(() => {
    // Reset states on opening another appointment
    setMethod(PAYMENT_METHOD.CASH);
    setCashTendered("");
    setChangeDue(0);
    setPosState("idle");
    setPosTerminalLog("");
    setWalletSuccess(false);
  }, [appointment, isOpen]);

  // Live cash change calculation
  useEffect(() => {
    const tendered = parseFloat(cashTendered) || 0;
    if (tendered >= remainingDue) {
      setChangeDue(tendered - remainingDue);
    } else {
      setChangeDue(0);
    }
  }, [cashTendered, remainingDue]);

  if (!appointment) return null;

  const handlePOSSync = () => {
    setPosState("connecting");
    setPosTerminalLog("Pinging POS Terminal (IP: 192.168.1.150)...");

    setTimeout(() => {
      setPosState("sending");
      setPosTerminalLog(`Sending transaction amount: $${remainingDue.toFixed(2)} to terminal...`);

      setTimeout(() => {
        setPosState("swiping");
        setPosTerminalLog("Awaiting customer card tap/insert on POS terminal...");

        setTimeout(() => {
          setPosState("processing");
          setPosTerminalLog("Processing payment secure transaction...");

          setTimeout(() => {
            setPosState("approved");
            setPosTerminalLog("POS Transaction Approved! Auth Ref: POS-829471");
            toast.success("POS Payment authorized!");
          }, 1200);
        }, 1500);
      }, 1000);
    }, 800);
  };

  const handleWalletDebit = () => {
    if (walletBalance < remainingDue) {
      toast.error("Insufficient wallet balance!");
      return;
    }
    setWalletBalance(prev => prev - remainingDue);
    setWalletSuccess(true);
    toast.success("Wallet debited successfully!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (method === PAYMENT_METHOD.CASH) {
      const tendered = parseFloat(cashTendered) || 0;
      if (tendered < remainingDue) {
        toast.error(`Please collect full remaining amount ($${remainingDue.toFixed(2)})`);
        return;
      }
    }

    if (method === PAYMENT_METHOD.CARD && posState !== "approved") {
      toast.error("Please sync and approve the payment on the POS terminal first.");
      return;
    }

    if (method === PAYMENT_METHOD.WALLET && !walletSuccess) {
      toast.error("Please process the wallet debit transaction first.");
      return;
    }

    // Call update mutation
    updatePayment({
      id: appointment.id,
      paymentStatus: PAYMENT_STATUS.PAID,
      paymentMethod: method,
      paidAmount: totalAmount, // Set full amount paid
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Collect In-Clinic Payment" size="md">
      <div className="space-y-6 pt-4 text-slate-700">
        {/* Patient Summary Header */}
        <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Receipt Details</span>
            <h4 className="text-lg font-black text-slate-900 mt-1">{appointment.patientName}</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{appointment.serviceName} • Dr. {appointment.doctorName}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Price</span>
            <p className="text-2xl font-black text-brand-600 mt-0.5">${totalAmount}</p>
          </div>
        </div>

        {/* Payment Ledger breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-100 p-4 text-center bg-white">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Total Due</span>
            <span className="text-lg font-black text-slate-800 block mt-1">${totalAmount}</span>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4 text-center bg-white">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Paid So Far</span>
            <span className="text-lg font-black text-emerald-600 block mt-1">${alreadyPaid}</span>
          </div>
          <div className="rounded-2xl border border-rose-100 p-4 text-center bg-rose-50/30">
            <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 block">Remaining Due</span>
            <span className="text-lg font-black text-rose-600 block mt-1">${remainingDue}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: PAYMENT_METHOD.CASH, name: "Cash", icon: "faMoneyBillWave" },
              { id: PAYMENT_METHOD.CARD, name: "Card POS", icon: "faCreditCard" },
              { id: PAYMENT_METHOD.WALLET, name: "Wallet", icon: "faWallet" }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`h-16 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all duration-300 font-bold ${
                  method === m.id
                    ? "border-brand-500 bg-brand-50/30 text-brand-600 shadow-halo"
                    : "border-slate-100 bg-white text-slate-500 hover:border-brand-200"
                }`}
              >
                <Icon name={m.icon} className="text-lg" />
                <span className="text-xs">{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Payment Details Fields */}
        <div className="rounded-3xl border border-slate-100 bg-slate-50/30 p-5 min-h-[160px] flex flex-col justify-center">
          {method === PAYMENT_METHOD.CASH && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    label={`Amount to Collect ($${remainingDue.toFixed(2)})`}
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder="Enter cash received"
                    className="h-12 rounded-2xl"
                  />
                </div>
                <div className="w-1/3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2 ml-1">Change Due</label>
                  <div className="h-12 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-center font-black text-lg text-brand-600">
                    ${changeDue.toFixed(2)}
                  </div>
                </div>
              </div>
              {parseFloat(cashTendered) < remainingDue && cashTendered !== "" && (
                <p className="text-[10px] text-rose-500 font-bold ml-1">
                  ⚠️ Amount is less than remaining due balance of ${remainingDue.toFixed(2)}
                </p>
              )}
            </div>
          )}

          {method === PAYMENT_METHOD.CARD && (
            <div className="space-y-4 text-center">
              <p className="text-xs font-bold text-slate-500">
                Synchronize this payment directly with the reception desktop terminal.
              </p>
              
              {posState === "idle" ? (
                <Button
                  onClick={handlePOSSync}
                  className="w-full h-12 rounded-2xl gap-2 shadow-md bg-brand-500 text-white"
                >
                  <Icon name="faWifi" />
                  Initiate POS Terminal Sync (${remainingDue.toFixed(2)})
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-brand-500">
                    {posState !== "approved" && (
                      <Icon name="faSpinner" className="animate-spin text-sm" />
                    )}
                    <span>{posState}</span>
                  </div>
                  <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-3 rounded-2xl text-left border border-white/5 shadow-inner">
                    &gt; {posTerminalLog}
                  </div>
                  {posState !== "approved" && (
                    <Button
                      variant="ghost"
                      onClick={() => setPosState("idle")}
                      className="text-xs h-8 text-slate-400"
                    >
                      Cancel Sync
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {method === PAYMENT_METHOD.WALLET && (
            <div className="space-y-4 text-center">
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold text-slate-500">Patient Wallet Balance:</span>
                <span className="font-black text-lg text-slate-800">${walletBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold text-slate-500">Transaction Fee:</span>
                <span className="font-black text-slate-400">$0.00</span>
              </div>

              {walletSuccess ? (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase text-emerald-600">
                  <Icon name="faCheckCircle" />
                  Wallet Debit Approved
                </div>
              ) : (
                <Button
                  onClick={handleWalletDebit}
                  disabled={walletBalance < remainingDue}
                  className="w-full h-12 rounded-2xl gap-2 shadow-md bg-brand-500 text-white"
                >
                  <Icon name="faShieldAlt" />
                  Confirm Wallet Debit (${remainingDue.toFixed(2)})
                </Button>
              )}
              {walletBalance < remainingDue && (
                <p className="text-[10px] text-rose-500 font-bold">
                  ⚠️ Patient has insufficient wallet balance. Please select card or cash method instead.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose}>Discard</Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating || (method === PAYMENT_METHOD.CARD && posState !== "approved") || (method === PAYMENT_METHOD.WALLET && !walletSuccess)}
            className="px-8 shadow-halo"
          >
            {isUpdating ? "Processing..." : "Record & Confirm Payment"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
