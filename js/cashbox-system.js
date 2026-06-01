/**
 * 💰 نظام الصناديق المتقدم (Cashbox System)
 * إدارة الصندوق العام والصرافة مع ربطهما بالحركات
 */

import { db } from "../config/firebase-config.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ============================================
// 📦 أنواع الصناديق
// ============================================

export const CASHBOX_TYPES = {
  GENERAL: 'general',      // الصندوق العام
  TRANSFER: 'transfer'     // الصرافة
};

// ============================================
// 📊 أنواع الحركات
// ============================================

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',           // إيداع
  WITHDRAWAL: 'withdrawal',     // سحب
  TRANSFER: 'transfer',         // تحويل
  READING_PAYMENT: 'reading_payment',  // دفع قراءة
  EXPENSE: 'expense',           // مصروف
  REFUND: 'refund'              // استرجاع
};

// ============================================
// 🔧 إدارة الصندوق العام
// ============================================

export class GeneralCashbox {
  constructor(projectId) {
    this.projectId = projectId;
    this.docRef = doc(db, `projects/${projectId}/cashboxes/general`);
  }

  async initialize() {
    const snap = await getDoc(this.docRef);
    if (!snap.exists()) {
      await setDoc(this.docRef, {
        type: CASHBOX_TYPES.GENERAL,
        balance: 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }
  }

  async getBalance() {
    const snap = await getDoc(this.docRef);
    return snap.exists() ? snap.data().balance : 0;
  }

  async deposit(amount, description = '', source = '') {
    if (amount <= 0) throw new Error('المبلغ يجب أن يكون موجب');

    const balance = await this.getBalance();
    const newBalance = balance + amount;

    await updateDoc(this.docRef, { balance: newBalance, lastUpdated: new Date().toISOString() });
    await this.logTransaction({
      type: TRANSACTION_TYPES.DEPOSIT,
      amount: amount,
      description: description,
      source: source,
      balanceBefore: balance,
      balanceAfter: newBalance
    });

    return { success: true, newBalance };
  }

  async withdraw(amount, description = '', reason = '') {
    if (amount <= 0) throw new Error('المبلغ يجب أن يكون موجب');

    const balance = await this.getBalance();
    if (balance < amount) throw new Error('رصيد غير كافي');

    const newBalance = balance - amount;
    await updateDoc(this.docRef, { balance: newBalance, lastUpdated: new Date().toISOString() });
    await this.logTransaction({
      type: TRANSACTION_TYPES.WITHDRAWAL,
      amount: amount,
      description: description,
      reason: reason,
      balanceBefore: balance,
      balanceAfter: newBalance
    });

    return { success: true, newBalance };
  }

  async transfer(amount, targetType = CASHBOX_TYPES.TRANSFER, description = '') {
    if (amount <= 0) throw new Error('المبلغ يجب أن يكون موجب');

    const balance = await this.getBalance();
    if (balance < amount) throw new Error('رصيد غير كافي');

    const newBalance = balance - amount;
    await updateDoc(this.docRef, { balance: newBalance, lastUpdated: new Date().toISOString() });

    if (targetType === CASHBOX_TYPES.TRANSFER) {
      const transfer = new TransferCashbox(this.projectId);
      await transfer.receive(amount, 'تحويل من الصندوق العام');
    }

    await this.logTransaction({
      type: TRANSACTION_TYPES.TRANSFER,
      amount: amount,
      description: description,
      targetType: targetType,
      balanceBefore: balance,
      balanceAfter: newBalance
    });

    return { success: true, newBalance };
  }

  async logTransaction(transaction) {
    const transactionsRef = collection(db, `projects/${this.projectId}/cashboxes/general/transactions`);
    await addDoc(transactionsRef, {
      ...transaction,
      timestamp: new Date().toISOString()
    });
  }

  async getTransactions(limit = 50) {
    const transactionsRef = collection(db, `projects/${this.projectId}/cashboxes/general/transactions`);
    const q = query(transactionsRef, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

// ============================================
// 🔧 إدارة الصرافة
// ============================================

export class TransferCashbox {
  constructor(projectId) {
    this.projectId = projectId;
    this.docRef = doc(db, `projects/${projectId}/cashboxes/transfer`);
  }

  async initialize() {
    const snap = await getDoc(this.docRef);
    if (!snap.exists()) {
      await setDoc(this.docRef, {
        type: CASHBOX_TYPES.TRANSFER,
        balance: 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }
  }

  async getBalance() {
    const snap = await getDoc(this.docRef);
    return snap.exists() ? snap.data().balance : 0;
  }

  async receive(amount, description = '') {
    if (amount <= 0) throw new Error('المبلغ يجب أن يكون موجب');

    const balance = await this.getBalance();
    const newBalance = balance + amount;

    await updateDoc(this.docRef, { balance: newBalance, lastUpdated: new Date().toISOString() });
    await this.logTransaction({
      type: 'receive',
      amount: amount,
      description: description,
      balanceBefore: balance,
      balanceAfter: newBalance
    });

    return { success: true, newBalance };
  }

  async withdraw(amount, description = '') {
    if (amount <= 0) throw new Error('المبلغ يجب أن يكون موجب');

    const balance = await this.getBalance();
    if (balance < amount) throw new Error('رصيد غير كافي');

    const newBalance = balance - amount;
    await updateDoc(this.docRef, { balance: newBalance, lastUpdated: new Date().toISOString() });
    await this.logTransaction({
      type: 'withdraw',
      amount: amount,
      description: description,
      balanceBefore: balance,
      balanceAfter: newBalance
    });

    return { success: true, newBalance };
  }

  async logTransaction(transaction) {
    const transactionsRef = collection(db, `projects/${this.projectId}/cashboxes/transfer/transactions`);
    await addDoc(transactionsRef, {
      ...transaction,
      timestamp: new Date().toISOString()
    });
  }

  async getTransactions(limit = 50) {
    const transactionsRef = collection(db, `projects/${this.projectId}/cashboxes/transfer/transactions`);
    const q = query(transactionsRef, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

// ============================================
// 📋 نظام التقارير المالية
// ============================================

export class CashboxReports {
  constructor(projectId) {
    this.projectId = projectId;
  }

  async getDailyReport(date) {
    const general = new GeneralCashbox(this.projectId);
    const transfer = new TransferCashbox(this.projectId);

    const generalBalance = await general.getBalance();
    const transferBalance = await transfer.getBalance();

    return {
      date: date,
      general: generalBalance,
      transfer: transferBalance,
      total: generalBalance + transferBalance
    };
  }

  async getMonthlyReport(year, month) {
    const general = new GeneralCashbox(this.projectId);
    const transfer = new TransferCashbox(this.projectId);

    const generalTransactions = await general.getTransactions(1000);
    const transferTransactions = await transfer.getTransactions(1000);

    const filterByMonth = (trans) => {
      const date = new Date(trans.timestamp);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    };

    const generalMonthly = generalTransactions.filter(filterByMonth);
    const transferMonthly = transferTransactions.filter(filterByMonth);

    const generalDeposits = generalMonthly
      .filter(t => t.type === TRANSACTION_TYPES.DEPOSIT)
      .reduce((sum, t) => sum + t.amount, 0);

    const generalWithdrawals = generalMonthly
      .filter(t => t.type === TRANSACTION_TYPES.WITHDRAWAL)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      period: `${month}/${year}`,
      general: {
        deposits: generalDeposits,
        withdrawals: generalWithdrawals,
        transactions: generalMonthly.length
      },
      transfer: {
        transactions: transferMonthly.length
      }
    };
  }
}

export default { GeneralCashbox, TransferCashbox, CashboxReports };