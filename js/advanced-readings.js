/**
 * 📊 نظام القراءات المتقدم (Advanced Readings System)
 * بدون سالب مع تحقق من الصحة والربط بالصناديق
 */

import { db } from "../config/firebase-config.js";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { GeneralCashbox } from "./cashbox-system.js";

// ============================================
// 📈 نظام القراءات
// ============================================

export class ReadingSystem {
  constructor(projectId, subscriberId) {
    this.projectId = projectId;
    this.subscriberId = subscriberId;
    this.cashbox = new GeneralCashbox(projectId);
  }

  async addReading(currentReading, notes = '') {
    // التحقق من أن القراءة موجبة
    if (currentReading <= 0) {
      throw new Error('❌ القراءة يجب أن تكون موجبة');
    }

    // الحصول على آخر قراءة
    const lastReading = await this.getLastReading();
    
    if (lastReading && currentReading < lastReading.reading) {
      throw new Error('❌ لا يمكن إدخال قراءة أقل من القراءة السابقة');
    }

    const consumption = lastReading ? currentReading - lastReading.reading : currentReading;
    const amount = consumption * (await this.getUnitPrice());

    const readingRef = await addDoc(
      collection(db, `projects/${this.projectId}/readings`),
      {
        subscriberId: this.subscriberId,
        reading: currentReading,
        previousReading: lastReading?.reading || 0,
        consumption: consumption,
        amount: amount,
        notes: notes,
        status: 'pending',
        createdAt: new Date().toISOString(),
        recordedBy: 'system'
      }
    );

    return {
      id: readingRef.id,
      reading: currentReading,
      consumption: consumption,
      amount: amount
    };
  }

  async confirmReading(readingId) {
    const readingRef = doc(db, `projects/${this.projectId}/readings/${readingId}`);
    const readingSnap = await getDoc(readingRef);
    
    if (!readingSnap.exists()) {
      throw new Error('القراءة غير موجودة');
    }

    const reading = readingSnap.data();

    // تحديث حالة القراءة
    await updateDoc(readingRef, { status: 'confirmed' });

    // إضافة المبلغ للصندوق
    await this.cashbox.deposit(
      reading.amount,
      `دفع قراءة للمشترك: ${this.subscriberId}`,
      'reading_payment'
    );

    return { success: true, amount: reading.amount };
  }

  async getLastReading() {
    const readingsRef = collection(db, `projects/${this.projectId}/readings`);
    const q = query(
      readingsRef,
      where('subscriberId', '==', this.subscriberId),
      orderBy('createdAt', 'desc')
    );
    
    const snap = await getDocs(q);
    if (snap.empty) return null;
    
    return snap.docs[0].data();
  }

  async getUnitPrice() {
    const projectRef = doc(db, `projects/${this.projectId}`);
    const projectSnap = await getDoc(projectRef);
    
    if (!projectSnap.exists()) {
      throw new Error('المشروع غير موجود');
    }

    return projectSnap.data().settings?.unitPrice || 150;
  }

  async getAllReadings() {
    const readingsRef = collection(db, `projects/${this.projectId}/readings`);
    const q = query(
      readingsRef,
      where('subscriberId', '==', this.subscriberId),
      orderBy('createdAt', 'desc')
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

// ============================================
// 📋 نظام فواتير القراءات
// ============================================

export class ReadingInvoice {
  constructor(projectId) {
    this.projectId = projectId;
  }

  async generateInvoice(subscriberId) {
    const readingsRef = collection(db, `projects/${this.projectId}/readings`);
    const q = query(
      readingsRef,
      where('subscriberId', '==', subscriberId),
      where('status', '==', 'confirmed')
    );
    
    const snap = await getDocs(q);
    const readings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalAmount = readings.reduce((sum, r) => sum + r.amount, 0);
    const totalConsumption = readings.reduce((sum, r) => sum + r.consumption, 0);

    return {
      subscriberId: subscriberId,
      readings: readings,
      totalConsumption: totalConsumption,
      totalAmount: totalAmount,
      generatedAt: new Date().toISOString()
    };
  }
}

export default { ReadingSystem, ReadingInvoice };