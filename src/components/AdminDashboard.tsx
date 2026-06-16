import React, { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc 
} from "firebase/firestore";
import { 
  Check, X, Search, ShieldCheck, Mail, Calendar, 
  ArrowLeft, RefreshCw, AlertTriangle, Clock, PlayCircle, 
  Clipboard, HeartHandshake, HelpCircle, CheckCircle2, XCircle, ChevronRight
} from "lucide-react";
import { db, auth, isFirebaseConfigured, handleFirestoreError, OperationType } from "../firebase";
import { UpiPaymentModel, UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AdminDashboardProps {
  onBack: () => void;
  triggerToast: (msg: string) => void;
}

export default function AdminDashboard({ onBack, triggerToast }: AdminDashboardProps) {
  const [payments, setPayments] = useState<UpiPaymentModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  
  // Rejection modal state
  const [rejectionTarget, setRejectionTarget] = useState<UpiPaymentModel | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null); // holds payment ID while updating

  const fetchPayments = async () => {
    if (!isFirebaseConfigured) return;
    setLoading(true);
    try {
      const collRef = collection(db, "upiPayments");
      const snap = await getDocs(collRef);
      const list: UpiPaymentModel[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          ...data
        } as UpiPaymentModel);
      });
      // Sort payments by newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPayments(list);
    } catch (err) {
      console.error("Error loading UPI payments:", err);
      triggerToast("Error loading payment requests from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const calculateExpiry = (planId: "trial" | "monthly" | "yearly"): string => {
    const now = new Date();
    if (planId === "trial") {
      now.setDate(now.getDate() + 3);
    } else if (planId === "monthly") {
      now.setDate(now.getDate() + 30);
    } else if (planId === "yearly") {
      now.setDate(now.getDate() + 365);
    }
    return now.toISOString();
  };

  const handleApprove = async (payment: UpiPaymentModel) => {
    if (!isFirebaseConfigured || actionLoading) return;
    setActionLoading(payment.id);
    try {
      // 1. Update the payment record status in UPI collection
      const paymentDocRef = doc(db, "upiPayments", payment.id);
      await setDoc(paymentDocRef, {
        ...payment,
        status: "approved",
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // 2. Fetch the target user goal document & update premium details
      const userDocRef = doc(db, "users", payment.userId);
      const userSnap = await getDoc(userDocRef);
      
      const expiryDate = calculateExpiry(payment.planId);

      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        await setDoc(userDocRef, {
          ...userData,
          isPremium: true,
          trialActive: payment.planId === "trial",
          trialStartDate: payment.planId === "trial" ? new Date().toISOString() : userData.trialStartDate,
          subscriptionExpiry: expiryDate,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        // Fallback or legacy user document initialization
        await setDoc(userDocRef, {
          userId: payment.userId,
          name: payment.userName || "Subscriber",
          email: payment.userEmail,
          isPremium: true,
          trialActive: payment.planId === "trial",
          subscriptionExpiry: expiryDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          streakDays: 1,
          age: 28, weight: 70, height: 170, calorieTarget: 2000, waterTarget: 2, dietaryPreference: "Standard", waterActive: true, mealReminders: "Breakfast"
        }, { merge: true });
      }

      triggerToast(`Order approved! Premium activated until ${new Date(expiryDate).toLocaleDateString()}`);
      // Refresh list
      await fetchPayments();
    } catch (err) {
      console.error("Error approving manual UPI payment", err);
      handleFirestoreError(err, OperationType.WRITE, `upiPayments/${payment.id}`);
    } finally {
      setActionLoading(null);
    }
  };

  const submitReject = async () => {
    if (!rejectionTarget || actionLoading) return;
    setActionLoading(rejectionTarget.id);
    try {
      const paymentDocRef = doc(db, "upiPayments", rejectionTarget.id);
      await setDoc(paymentDocRef, {
        ...rejectionTarget,
        status: "rejected",
        adminNote: rejectReason || "Rejected by admin review.",
        updatedAt: new Date().toISOString()
      }, { merge: true });

      triggerToast(`Order ${rejectionTarget.transactionId.substring(0, 8)} successfully rejected.`);
      setRejectionTarget(null);
      setRejectReason("");
      await fetchPayments();
    } catch (err) {
      console.error("Error setting reject state on database", err);
      handleFirestoreError(err, OperationType.WRITE, `upiPayments/${rejectionTarget.id}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter payments list
  const filteredPayments = payments.filter((pay) => {
    const matchesStatus = statusFilter === "all" || pay.status === statusFilter;
    const matchesSearch = 
      pay.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pay.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pay.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 md:p-6 rounded-[28px] border border-zinc-200 dark:border-zinc-800 text-left min-h-[60vh] flex flex-col gap-6" id="upi-admin-dashboard-root">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer active:scale-95 transition-all"
            title="Return to profile"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                Admin Secure Area
              </span>
            </div>
            <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mt-1">
              UPI Invoice Auditing Dashboard
            </h1>
          </div>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-750 dark:text-zinc-305 border border-zinc-200 dark:border-zinc-850 rounded-xl transition-all cursor-pointer active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Database</span>
        </button>
      </div>

      {/* Database connection state warning */}
      {!isFirebaseConfigured && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-2xl flex items-start gap-2.5 leading-normal">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
          <span>
            <strong>Cloud Connection Unconfigured:</strong> Firebase system credentials are not configured in your VITE workspace environment variables. Real manual bank operations cannot write to databases in local sandbox previews.
          </span>
        </div>
      )}

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Field */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by User Email, Name, or UPI Ref Transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium bg-white dark:bg-zinc-900 focus:bg-zinc-50 dark:focus:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-650 rounded-xl pl-10 pr-4 py-3 placeholder:text-zinc-400 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Tab Switcher Filters */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/40 dark:border-zinc-800/80 shrink-0">
          {(["pending", "approved", "rejected", "all"] as const).map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`py-1.5 px-4.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-zinc-850 text-zinc-950 dark:text-white shadow-sm font-extrabold"
                    : "text-zinc-550 dark:text-zinc-400 hover:text-zinc-850 dark:hover:text-zinc-250"
                }`}
              >
                {status}
                {/* Visual badges counters */}
                {status !== "all" && (
                  <span className={`ml-1.5 text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                    status === "pending" 
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                      : status === "approved" 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}>
                    {payments.filter(p => p.status === status).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Payments Request List */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="text-xs font-semibold text-zinc-405 dark:text-zinc-400">
            Querying UPI requests collection stream...
          </span>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150 dark:border-zinc-850/60 p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400 dark:text-zinc-650">
            <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-850 dark:text-zinc-100">No payment records found</h3>
            <p className="text-xs text-zinc-450 dark:text-zinc-400 mt-1 max-w-sm">
              Either there are no manual payments under the ({statusFilter}) status filter, or your query search "{searchQuery}" did not yield any metrics.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredPayments.map((payment) => {
            const isPending = payment.status === "pending";
            const isApproved = payment.status === "approved";
            const isRejected = payment.status === "rejected";

            return (
              <div 
                key={payment.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-sm transition-all"
              >
                {/* User info & subscription meta column */}
                <div className="flex-1 flex flex-col gap-2 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-50">
                      {payment.userName || "Subscriber"}
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      payment.paymentMethod === "usdt_trc20"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    }`}>
                      {payment.paymentMethod === "usdt_trc20" ? "USDT (TRC-20)" : "UPI"}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold">•</span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-355 flex items-center gap-1.5 font-medium">
                      <Mail className="w-3 h-3 text-zinc-400" /> {payment.userEmail}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5 mt-1 border-t border-zinc-100/60 dark:border-zinc-800/60 pt-2 pb-0.5">
                    <div>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Plan Selection</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                        {payment.planName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Billed Charge</span>
                      <span className="text-xs font-black text-zinc-850 dark:text-zinc-100 mt-0.2 block text-emerald-600 dark:text-emerald-450">
                        {payment.currency === "INR" ? "₹" : payment.currency === "USD" ? "$" : payment.currency}{payment.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">
                        {payment.paymentMethod === "usdt_trc20" ? "USDT Transaction Hash (TXID)" : "UPI Ref / UTR Transaction ID"}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs font-bold font-mono tracking-wider text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-950 px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 rounded select-all leading-tight max-w-[210px] sm:max-w-[400px] truncate block" title={payment.transactionId}>
                          {payment.transactionId}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(payment.transactionId);
                            triggerToast("Transaction ID copied to clipboard!");
                          }}
                          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                          title="Copy reference UTR Number"
                        >
                          <Clipboard className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-zinc-400 font-medium">
                    <Calendar className="w-3 h-3 text-zinc-305" />
                    <span>Submitted: {new Date(payment.createdAt).toLocaleString()}</span>
                    {payment.updatedAt && (
                      <>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <span>Audited: {new Date(payment.updatedAt).toLocaleString()}</span>
                      </>
                    )}
                  </div>

                  {/* Rejected Notes info */}
                  {isRejected && payment.adminNote && (
                    <div className="mt-2 text-xs p-2.5 rounded-xl border border-red-500/15 bg-red-500/5 text-red-700 dark:text-red-400 font-medium">
                      <strong>Rejection Reason:</strong> {payment.adminNote}
                    </div>
                  )}

                  {isApproved && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Licensing server credentials deployed to subscriber.</span>
                    </div>
                  )}
                </div>

                {/* Status and Action Buttons Column */}
                <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-2.5 w-full md:w-auto mt-2 md:mt-0 border-t md:border-none border-zinc-100/60 dark:border-zinc-800/60 pt-3.5 md:pt-0">
                  {/* Status pills badges */}
                  <div>
                    {isPending && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" /> Pending Audit
                      </span>
                    )}

                    {isApproved && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    )}

                    {isRejected && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    )}
                  </div>

                  {/* Operational actions */}
                  {isPending && (
                    <div className="flex items-center gap-1.5">
                      {/* Reject button */}
                      <button
                        onClick={() => setRejectionTarget(payment)}
                        disabled={actionLoading !== null}
                        className="p-2 w-9 h-9 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-all cursor-pointer active:scale-90"
                        title="Reject Invoice"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Approve Button */}
                      <button
                        onClick={() => handleApprove(payment)}
                        disabled={actionLoading !== null}
                        className="px-4 h-9 bg-emerald-550 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                        title="Approve Premium"
                      >
                        {actionLoading === payment.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 text-white" />
                            <span>Verify & Approve</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Rejection Modal Overlay popup */}
      <AnimatePresence>
        {rejectionTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md cursor-pointer"
              onClick={() => setRejectionTarget(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-5 md:p-6 z-10 flex flex-col gap-4 text-left shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/40 px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Reject Payment Request
                </span>
                <button
                  onClick={() => setRejectionTarget(null)}
                  className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-500 font-bold flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Transaction: <span className="font-mono">{rejectionTarget.transactionId}</span>
                </h3>
                <p className="text-xs text-zinc-450 dark:text-zinc-400 mt-1">
                  Specify the reason for rejecting this manual bank remittance. The user will see this notification directly.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Rejection Notes
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="E.g., Transaction ID not found on bank portal, incorrect price paid, image verification failed, etc."
                  rows={3}
                  className="w-full text-xs font-medium bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-red-500/50 outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectionTarget(null);
                    setRejectReason("");
                  }}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 font-bold text-xs text-zinc-700 dark:text-zinc-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReject}
                  disabled={actionLoading !== null}
                  className="px-5 py-2 bg-gradient-to-r from-red-550 to-red-650 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
