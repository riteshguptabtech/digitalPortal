/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [bills, setBills] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [rechargeDiscountPercent, setRechargeDiscountPercent] = useState(0);
  const [paymentQr, setPaymentQr] = useState(null);
  const [wallet, setWallet] = useState({});
  const [toasts, setToasts] = useState([]);
  const [isBooting, setIsBooting] = useState(true);

  // ---------------- TOAST ----------------
  const addToast = (message, type = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // ---------------- INIT ----------------
  useEffect(() => {
    async function bootstrap() {
      try {
        const data = await api("/bootstrap");
        setBills(data.bills || []);
        setDeposits(data.deposits || []);
        setDiscountPercent(data.discountPercent || 0);
        setRechargeDiscountPercent(data.rechargeDiscountPercent || 0);
        setPaymentQr(data.paymentQr || null);
        setWallet(data.wallet || {});
      } catch (err) {
        addToast(err.message, "error");
      } finally {
        setIsBooting(false);
      }
    }

    bootstrap();
  }, []);

  // ---------------- AUTH ----------------
  const login = async (username, password) => {
    try {
      const data = await api("/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (!data.user) {
        return { success: false, message: "Invalid credentials" };
      }

      setCurrentUser(data.user);

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Login failed" };
    }
  };

  const signup = async (userDetails) => {
    try {
      const data = await api("/signup", {
        method: "POST",
        body: JSON.stringify(userDetails),
      });

      setCurrentUser(data.user);

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // ---------------- BILLS ----------------
  const submitBill = async (billData) => {
    const data = await api("/bills", {
      method: "POST",
      body: JSON.stringify({
        userId: currentUser.id,
        ...billData,
      }),
    });

    setBills((prev) => [data.bill, ...prev]);
    if (data.wallet) {
      setWallet((prev) => ({ ...prev, ...data.wallet }));
    }
    addToast("Bill submitted successfully!", "success");
  };

  const submitRecharge = async (rechargeData) => {
    const data = await api("/bills", {
      method: "POST",
      body: JSON.stringify({
        userId: currentUser.id,
        requestType: "mobile_recharge",
        ...rechargeData,
      }),
    });

    setBills((prev) => [data.bill, ...prev]);
    if (data.wallet) {
      setWallet((prev) => ({ ...prev, ...data.wallet }));
    }
    addToast("Recharge request submitted successfully!", "success");
  };

  const updateBillStatus = async (billId, status, rejectionReason = null) => {
    try {
      const data = await api(`/bills/${billId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, rejectionReason }),
      });

      setBills((prev) =>
        prev.map((b) => (b.id === billId ? data.bill : b))
      );

      if (data.wallet) {
        setWallet((prev) => ({ ...prev, ...data.wallet }));
      }

      const requestLabel = data.bill?.requestType === "mobile_recharge" ? "Recharge" : "Bill";
      addToast(
        status === "approved" ? `${requestLabel} approved` : `${requestLabel} rejected`,
        status === "approved" ? "success" : "error"
      );
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const approveBill = (id) => updateBillStatus(id, "approved");
  const rejectBill = (id, reason) =>
    updateBillStatus(id, "rejected", reason);

  // ---------------- WALLET ----------------
  const requestDeposit = async (userId, amount, transactionId) => {
    const data = await api("/wallet/deposit", {
      method: "POST",
      body: JSON.stringify({ userId, amount, transactionId }),
    });

    setDeposits((prev) => [data.deposit, ...prev]);
    addToast("Deposit request submitted for admin approval", "success");
  };

  const updateDepositStatus = async (depositId, status, rejectionReason = null) => {
    try {
      const data = await api(`/wallet/deposits/${depositId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, rejectionReason }),
      });

      setDeposits((prev) =>
        prev.map((deposit) => (deposit.id === depositId ? data.deposit : deposit))
      );

      if (data.wallet) {
        setWallet((prev) => ({ ...prev, ...data.wallet }));
      }

      addToast(
        status === "approved" ? "Deposit approved" : "Deposit rejected",
        status === "approved" ? "success" : "error"
      );
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const approveDeposit = (id) => updateDepositStatus(id, "approved");
  const rejectDeposit = (id, reason) => updateDepositStatus(id, "rejected", reason);

  // ---------------- SETTINGS ----------------
  const updateDiscountPercent = async (value, rechargeValue = rechargeDiscountPercent) => {
    const data = await api("/settings/discount", {
      method: "PATCH",
      body: JSON.stringify({
        discountPercent: value,
        rechargeDiscountPercent: rechargeValue,
      }),
    });

    setDiscountPercent(data.discountPercent);
    setRechargeDiscountPercent(data.rechargeDiscountPercent);
    addToast("Discounts updated successfully", "success");
  };

  const updatePaymentQr = async (qrData) => {
    const data = await api("/settings/payment-qr", {
      method: "PATCH",
      body: JSON.stringify(qrData),
    });

    setPaymentQr(data.paymentQr);
    addToast("Payment QR updated successfully", "success");
  };

  // ---------------- SELECTORS ----------------
  const getUserWallet = (userId) => wallet[userId] ?? 0;
  const getUserBills = (userId) =>
    bills.filter((b) => b.userId === userId);
  const getUserDeposits = (userId) =>
    deposits.filter((deposit) => deposit.userId === userId);

  const getAllBills = () => bills;
  const getAllDeposits = () => deposits;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        signup,
        logout,

        bills,
        submitBill,
        submitRecharge,
        approveBill,
        rejectBill,

        wallet,
        requestDeposit,
        approveDeposit,
        rejectDeposit,
        deposits,
        discountPercent,
        rechargeDiscountPercent,
        paymentQr,
        updateDiscountPercent,
        updatePaymentQr,

        getUserWallet,
        getUserBills,
        getUserDeposits,
        getAllBills,
        getAllDeposits,

        toasts,
        addToast,
        isBooting,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
