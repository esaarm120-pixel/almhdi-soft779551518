/**
 * 🔒 نظام عزل البيانات (Data Isolation System)
 * يضمن عدم رؤية بيانات مشروع في مشروع آخر
 */

import { db } from "../config/firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ============================================
// 🔍 دالة التحقق من انتماء البيانات للمشروع
// ============================================

/**
 * التحقق من أن المستخدم يمكنه الوصول لمشروع معين
 * @param {string} userId - معرف المستخدم
 * @param {string} projectId - معرف المشروع
 * @returns {boolean}
 */
export async function canAccessProject(userId, projectId) {
  try {
    // البحث عن المستخدم
    const userSnap = await getDoc(doc(db, "users", userId));
    
    if (!userSnap.exists()) return false;
    
    const userData = userSnap.data();
    
    // إذا كان سوبر أدمن، يمكنه الوصول لأي مشروع
    if (userData.role === "super_admin") return true;
    
    // البحث عن ارتباط المستخدم بالمشروع
    const userProjectsRef = collection(db, `projects/${projectId}/members`);
    const q = query(userProjectsRef, where("userId", "==", userId));
    const querySnap = await getDocs(q);
    
    return !querySnap.empty;
  } catch (error) {
    console.error("❌ خطأ في التحقق من الوصول:", error);
    return false;
  }
}

/**
 * الحصول على جميع مشاريع المستخدم التي يمكنه الوصول إليها
 * @param {string} userId - معرف المستخدم
 * @returns {array}
 */
export async function getUserAccessibleProjects(userId) {
  try {
    const userSnap = await getDoc(doc(db, "users", userId));
    
    if (!userSnap.exists()) return [];
    
    const userData = userSnap.data();
    let projects = [];
    
    // إذا كان سوبر أدمن، يحصل على جميع المشاريع
    if (userData.role === "super_admin") {
      const projectsSnap = await getDocs(collection(db, "projects"));
      projectsSnap.forEach(doc => {
        projects.push({ id: doc.id, ...doc.data() });
      });
    } else {
      // الحصول على المشاريع المرتبطة به
      const projectsSnap = await getDocs(collection(db, "projects"));
      
      for (const projectDoc of projectsSnap.docs) {
        const projectId = projectDoc.id;
        
        // التحقق من انتماء المستخدم للمشروع
        const memberRef = doc(db, `projects/${projectId}/members/${userId}`);
        const memberSnap = await getDoc(memberRef);
        
        if (memberSnap.exists()) {
          projects.push({ id: projectId, ...projectDoc.data() });
        }
      }
    }
    
    return projects;
  } catch (error) {
    console.error("❌ خطأ في جلب مشاريع المستخدم:", error);
    return [];
  }
}

// ============================================
// 📊 نظام الاستعلام الآمن (Secure Query System)
// ============================================

export class SecureDataQuery {
  constructor(userId, projectId) {
    this.userId = userId;
    this.projectId = projectId;
    this.isVerified = false;
  }

  /**
   * التحقق من الوصول قبل أي عملية
   */
  async verify() {
    this.isVerified = await canAccessProject(this.userId, this.projectId);
    return this.isVerified;
  }

  /**
   * الحصول على المشتركين الآمن
   */
  async getSubscribers() {
    if (!this.isVerified && !(await this.verify())) {
      throw new Error("❌ ليس لديك صلاحية الوصول لهذا المشروع");
    }

    try {
      const subscribersRef = collection(
        db,
        `projects/${this.projectId}/subscribers`
      );
      const querySnap = await getDocs(subscribersRef);
      
      const subscribers = [];
      querySnap.forEach(doc => {
        subscribers.push({ id: doc.id, ...doc.data() });
      });
      
      return subscribers;
    } catch (error) {
      console.error("❌ خطأ في جلب المشتركين:", error);
      throw error;
    }
  }

  /**
   * الحصول على مشترك واحد
   */
  async getSubscriber(subscriberId) {
    if (!this.isVerified && !(await this.verify())) {
      throw new Error("❌ ليس لديك صلاحية الوصول لهذا المشروع");
    }

    try {
      const docRef = doc(
        db,
        `projects/${this.projectId}/subscribers/${subscriberId}`
      );
      const docSnap = await getDoc(docRef);
      
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error("❌ خطأ في جلب المشترك:", error);
      throw error;
    }
  }

  /**
   * إضافة مشترك جديد
   */
  async addSubscriber(subscriberData) {
    if (!this.isVerified && !(await this.verify())) {
      throw new Error("❌ ليس لديك صلاحية الوصول لهذا المشروع");
    }

    try {
      const subscribersRef = collection(
        db,
        `projects/${this.projectId}/subscribers`
      );
      
      const newSubscriber = {
        ...subscriberData,
        projectId: this.projectId,
        createdAt: new Date().toISOString(),
        createdBy: this.userId
      };
      
      const docRef = await addDoc(subscribersRef, newSubscriber);
      return { id: docRef.id, ...newSubscriber };
    } catch (error) {
      console.error("❌ خطأ في إضافة المشترك:", error);
      throw error;
    }
  }

  /**
   * تحديث بيانات مشترك
   */
  async updateSubscriber(subscriberId, updateData) {
    if (!this.isVerified && !(await this.verify())) {
      throw new Error("❌ ليس لديك صلاحية الوصول لهذا المشروع");
    }

    try {
      const docRef = doc(
        db,
        `projects/${this.projectId}/subscribers/${subscriberId}`
      );
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: this.userId
      });
      
      return { success: true };
    } catch (error) {
      console.error("❌ خطأ في تحديث المشترك:", error);
      throw error;
    }
  }

  /**
   * حذف مشترك
   */
  async deleteSubscriber(subscriberId) {
    if (!this.isVerified && !(await this.verify())) {
      throw new Error("❌ ليس لديك صلاحية الوصول لهذا المشروع");
    }

    try {
      const docRef = doc(
        db,
        `projects/${this.projectId}/subscribers/${subscriberId}`
      );
      
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error("❌ خطأ في حذف المشترك:", error);
      throw error;
    }
  }

  /**
   * الحصول على الموظفين
   */
  async getEmployees() {
    if (!this.isVerified && !(await this.verify())) {
      throw new Error("❌ ليس لديك صلاحية الوصول لهذا المشروع");
    }

    try {
      const employeesRef = collection(
        db,
        `projects/${this.projectId}/employees`
      );
      const querySnap = await getDocs(employeesRef);
      
      const employees = [];
      querySnap.forEach(doc => {
        employees.push({ id: doc.id, ...doc.data() });
      });
      
      return employees;
    } catch (error) {
      console.error("❌ خطأ في جلب الموظفين:", error);
      throw error;
    }
  }

  /**
   * الحصول على المصروفات
   */
  async getExpenses() {
    if (!this.isVerified && !(await this.verify())) {
      throw new Error("❌ ليس لديك صلاحية الوصول لهذا المشروع");
    }

    try {
      const expensesRef = collection(
        db,
        `projects/${this.projectId}/expenses`
      );
      const querySnap = await getDocs(expensesRef);
      
      const expenses = [];
      querySnap.forEach(doc => {
        expenses.push({ id: doc.id, ...doc.data() });
      });
      
      return expenses;
    } catch (error) {
      console.error("❌ خطأ في جلب المصروفات:", error);
      throw error;
    }
  }

  /**
   * الحصول على القراءات
   */
  async getReadings() {
    if (!this.isVerified && !(await this.verify())) {
      throw new Error("❌ ليس لديك صلاحية الوصول لهذا المشروع");
    }

    try {
      const readingsRef = collection(
        db,
        `projects/${this.projectId}/readings`
      );
      const querySnap = await getDocs(readingsRef);
      
      const readings = [];
      querySnap.forEach(doc => {
        readings.push({ id: doc.id, ...doc.data() });
      });
      
      return readings;
    } catch (error) {
      console.error("❌ خطأ في جلب القراءات:", error);
      throw error;
    }
  }
}

// ============================================
// 🔐 دالة تنظيف البيانات الحساسة
// ============================================

export function sanitizeUserData(userData, userRole) {
  const sanitized = { ...userData };
  
  // إذا لم يكن سوبر أدمن، أخف البيانات الحساسة
  if (userRole !== "super_admin") {
    delete sanitized.password;
    delete sanitized.apiKey;
    delete sanitized.internalNotes;
  }
  
  return sanitized;
}

// ============================================
// 📦 تصدير النظام
// ============================================

export const DataIsolationSystem = {
  canAccessProject,
  getUserAccessibleProjects,
  SecureDataQuery,
  sanitizeUserData
};

export default DataIsolationSystem;
