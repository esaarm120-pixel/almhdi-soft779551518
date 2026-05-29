// 🛠️ ملف المساعدات والدوال المشتركة لكل الصفحات

/**
 * 📝 دالة حفظ البيانات في Firestore
 * @param {string} collection - اسم المجموعة (collection)
 * @param {string} docId - معرف المستند (opional)
 * @param {object} data - البيانات المراد حفظها
 */
export async function saveToFirestore(db, collection, docId, data) {
  try {
    const { collection: fireCollection, addDoc, setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    if (docId) {
      await setDoc(doc(db, collection, docId), data, { merge: true });
    } else {
      await addDoc(fireCollection(db, collection), data);
    }
    return { success: true, message: 'تم الحفظ بنجاح' };
  } catch (error) {
    console.error('❌ خطأ في الحفظ:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 📂 دالة جلب البيانات من Firestore
 * @param {object} db - Firebase database instance
 * @param {string} collection - اسم المجموعة
 * @param {string} docId - معرف المستند (optional)
 */
export async function getFromFirestore(db, collection, docId = null) {
  try {
    const { collection: fireCollection, getDocs, getDoc, doc, query } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    let result = [];
    if (docId) {
      const docSnap = await getDoc(doc(db, collection, docId));
      return docSnap.exists() ? docSnap.data() : null;
    } else {
      const querySnapshot = await getDocs(fireCollection(db, collection));
      querySnapshot.forEach((doc) => {
        result.push({ id: doc.id, ...doc.data() });
      });
    }
    return result;
  } catch (error) {
    console.error('❌ خطأ في الجلب:', error);
    return null;
  }
}

/**
 * 🗑️ دالة حذف بيانات من Firestore
 * @param {object} db - Firebase database instance
 * @param {string} collection - اسم المجموعة
 * @param {string} docId - معرف المستند
 */
export async function deleteFromFirestore(db, collection, docId) {
  try {
    const { deleteDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    await deleteDoc(doc(db, collection, docId));
    return { success: true, message: 'تم الحذف بنجاح' };
  } catch (error) {
    console.error('❌ خطأ في الحذف:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 💰 دالة حساب الفاتورة (الاستهلاك + الرسم)
 * @param {number} previousReading - القراءة السابقة
 * @param {number} currentReading - القراءة الحالية
 * @param {number} unitPrice - سعر الوحدة
 * @param {number} subscriptionFee - رسم الاشتراك
 */
export function calculateBill(previousReading, currentReading, unitPrice, subscriptionFee) {
  const consumption = Math.max(0, currentReading - previousReading);
  const billAmount = (consumption * unitPrice) + subscriptionFee;
  
  return {
    consumption,
    billAmount,
    details: {
      consumptionCost: consumption * unitPrice,
      subscriptionFee: subscriptionFee,
      total: billAmount
    }
  };
}

/**
 * 📱 دالة إرسال رسالة عبر واتساب
 * @param {string} phone - رقم الهاتف (بدون +967)
 * @param {string} message - محتوى الرسالة
 */
export function sendWhatsApp(phone, message) {
  const fullPhone = phone.startsWith('967') ? phone : `967${phone}`;
  const encodedMsg = encodeURIComponent(message);
  window.open(`https://wa.me/${fullPhone}?text=${encodedMsg}`, '_blank');
}

/**
 * 🖨️ دالة طباعة PDF (استخدام مكتبة pdfkit أو html2pdf)
 * @param {string} htmlContent - محتوى HTML للطباعة
 * @param {string} fileName - اسم الملف
 */
export function printToPDF(htmlContent, fileName = 'document.pdf') {
  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  
  // استخدام html2pdf library
  if (typeof html2pdf === 'undefined') {
    alert('⚠️ مكتبة PDF غير محملة. سيتم الطلب من المتصفح بحفظ الصفحة كـ PDF');
    window.print();
    return;
  }
  
  const opt = {
    margin: 10,
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };
  
  html2pdf().set(opt).from(element).save();
}

/**
 * ✅ دالة التحقق من صحة البريد الإلكتروني
 * @param {string} email
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * ✅ دالة التحقق من صحة رقم الهاتف اليمني
 * @param {string} phone
 */
export function isValidYemenPhone(phone) {
  return /^(77|73|71|70)\d{7}$/.test(phone);
}

/**
 * 🔒 دالة التحقق من أن المستخدم مسجل دخول
 */
export function checkAuthStatus() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user || !user.uid) {
    window.location.href = 'index.html';
    return false;
  }
  return user;
}

/**
 * 🚪 دالة تسجيل الخروج
 */
export function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('subscribers');
  localStorage.removeItem('employees');
  localStorage.removeItem('expenses');
  window.location.href = 'index.html';
}

/**
 * 📅 دالة تنسيق التاريخ
 * @param {Date} date
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 💵 دالة تنسيق العملة
 * @param {number} amount
 */
export function formatCurrency(amount) {
  return `${amount.toLocaleString('en-US')} ريال`;
}

/**
 * 🔔 دالة عرض إشعار النجاح
 * @param {string} message
 */
export function showSuccess(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #28a745;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 1000;
    font-weight: bold;
  `;
  notification.textContent = '✅ ' + message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
}

/**
 * ⚠️ دالة عرض إشعار الخطأ
 * @param {string} message
 */
export function showError(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #dc3545;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 1000;
    font-weight: bold;
  `;
  notification.textContent = '❌ ' + message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 4000);
}

/**
 * ⏳ دالة تأخير العملية (async/await)
 * @param {number} ms - عدد الميلي ثانية
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
