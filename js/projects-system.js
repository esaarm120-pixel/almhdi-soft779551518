// 🏢 نظام إدارة المشاريع (Projects Management System)

/**
 * 📊 حالات المشروع المتاحة
 */
export const PROJECT_STATUS = {
  ACTIVE: 'active',           // مشروع نشط
  INACTIVE: 'inactive',       // مشروع معطل
  PENDING: 'pending',         // قيد المراجعة
  SUSPENDED: 'suspended'      // معلق مؤقتاً
};

/**
 * 🎯 دالة إنشاء مشروع جديد
 * @param {object} db - Firestore instance
 * @param {object} projectData - بيانات المشروع
 */
export async function createProject(db, projectData) {
  try {
    const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    const newProject = {
      name: projectData.name,                    // اسم المشروع
      governorate: projectData.governorate,      // المحافظة
      directorate: projectData.directorate,      // المديرية
      village: projectData.village,              // القرية
      manager: projectData.manager,              // مدير المشروع
      managerPhone: projectData.managerPhone,    // رقم هاتف المدير
      adminUid: projectData.adminUid,            // معرف الـ Admin
      status: PROJECT_STATUS.ACTIVE,
      settings: {
        unitPrice: projectData.unitPrice || 150,              // سعر الوحدة
        subscriptionFee: projectData.subscriptionFee || 400,  // رسم الاشتراك
        currency: 'ريال يمني 🇾🇪',
        disconnectionWarning: 'إذا لم يتم السداد في فترة محددة سيتم فصل العداد',
        developer: 'عصام المهدي',
        developerPhone: '779551518'
      },
      logo: projectData.logo || null,            // شعار المشروع
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statistics: {
        totalSubscribers: 0,
        totalEmployees: 0,
        totalExpenses: 0,
        totalRevenue: 0
      }
    };
    
    const docRef = await addDoc(collection(db, 'projects'), newProject);
    
    return {
      success: true,
      projectId: docRef.id,
      message: 'تم إنشاء المشروع بنجاح'
    };
  } catch (error) {
    console.error('❌ خطأ في إنشاء المشروع:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 📂 دالة جلب جميع المشاريع
 * @param {object} db - Firestore instance
 * @param {boolean} onlyActive - جلب المشاريع النشطة فقط
 */
export async function getAllProjects(db, onlyActive = false) {
  try {
    const { collection, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    let q;
    if (onlyActive) {
      q = query(collection(db, 'projects'), where('status', '==', PROJECT_STATUS.ACTIVE));
    } else {
      q = collection(db, 'projects');
    }
    
    const querySnapshot = await getDocs(q);
    const projects = [];
    
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    
    return projects;
  } catch (error) {
    console.error('❌ خطأ في جلب المشاريع:', error);
    return [];
  }
}

/**
 * 📋 دالة جلب مشروع واحد
 * @param {object} db - Firestore instance
 * @param {string} projectId - معرف المشروع
 */
export async function getProjectById(db, projectId) {
  try {
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    const docSnap = await getDoc(doc(db, 'projects', projectId));
    
    if (docSnap.exists()) {
      return { id: projectId, ...docSnap.data() };
    }
    
    return null;
  } catch (error) {
    console.error('❌ خطأ في جلب المشروع:', error);
    return null;
  }
}

/**
 * 🔧 دالة تحديث بيانات المشروع
 * @param {object} db - Firestore instance
 * @param {string} projectId - معرف المشروع
 * @param {object} updateData - البيانات المراد تحديثها
 */
export async function updateProject(db, projectId, updateData) {
  try {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    updateData.updatedAt = new Date().toISOString();
    
    await setDoc(doc(db, 'projects', projectId), updateData, { merge: true });
    
    return { success: true, message: 'تم تحديث المشروع بنجاح' };
  } catch (error) {
    console.error('❌ خطأ في تحديث المشروع:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 🔒 دالة تغيير حالة المشروع (تفعيل/إيقاف)
 * @param {object} db - Firestore instance
 * @param {string} projectId - معرف المشروع
 * @param {string} newStatus - الحالة الجديدة
 */
export async function changeProjectStatus(db, projectId, newStatus) {
  try {
    const validStatuses = Object.values(PROJECT_STATUS);
    
    if (!validStatuses.includes(newStatus)) {
      return { success: false, message: 'حالة غير صحيحة' };
    }
    
    return await updateProject(db, projectId, { status: newStatus });
  } catch (error) {
    console.error('❌ خطأ في تغيير حالة المشروع:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 🗑️ دالة حذف مشروع
 * @param {object} db - Firestore instance
 * @param {string} projectId - معرف المشروع
 */
export async function deleteProject(db, projectId) {
  try {
    const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    // تحذير: هذه العملية خطيرة وتحذف جميع بيانات المشروع
    const confirmed = confirm(
      '⚠️ تحذير: هذه العملية ستحذف المشروع وجميع بيانات المشتركين والموظفين!\n' +
      'هل أنت متأكد من الحذف؟'
    );
    
    if (!confirmed) {
      return { success: false, message: 'تم الإلغاء' };
    }
    
    await deleteDoc(doc(db, 'projects', projectId));
    
    return { success: true, message: 'تم حذف المشروع بنجاح' };
  } catch (error) {
    console.error('❌ خطأ في حذف المشروع:', error);
    return { success: false, message: error.message };
  }
}

/**
 * ⚙️ دالة تحديث إعدادات المشروع
 * @param {object} db - Firestore instance
 * @param {string} projectId - معرف المشروع
 * @param {object} settings - الإعدادات الجديدة
 */
export async function updateProjectSettings(db, projectId, settings) {
  try {
    const project = await getProjectById(db, projectId);
    
    if (!project) {
      return { success: false, message: 'المشروع غير موجود' };
    }
    
    const updatedSettings = {
      ...project.settings,
      ...settings,
      updatedAt: new Date().toISOString()
    };
    
    return await updateProject(db, projectId, { settings: updatedSettings });
  } catch (error) {
    console.error('❌ خطأ في تحديث الإعدادات:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 📊 دالة تحديث إحصائيات المشروع
 * @param {object} db - Firestore instance
 * @param {string} projectId - معرف المشروع
 * @param {object} stats - الإحصائيات المراد تحديثها
 */
export async function updateProjectStatistics(db, projectId, stats) {
  try {
    const project = await getProjectById(db, projectId);
    
    if (!project) {
      return { success: false, message: 'المشروع غير موجود' };
    }
    
    const updatedStats = {
      ...project.statistics,
      ...stats
    };
    
    return await updateProject(db, projectId, { statistics: updatedStats });
  } catch (error) {
    console.error('❌ خطأ في تحديث الإحصائيات:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 👥 دالة جلب مشاريع مستخدم معين
 * @param {object} db - Firestore instance
 * @param {string} userId - معرف المستخدم
 */
export async function getUserProjects(db, userId) {
  try {
    const { collection, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    // جلب المشاريع التي يديرها هذا المستخدم
    const q = query(
      collection(db, 'projects'),
      where('adminUid', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const projects = [];
    
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    
    return projects;
  } catch (error) {
    console.error('❌ خطأ في جلب المشاريع:', error);
    return [];
  }
}

/**
 * ✅ دالة التحقق من أن المشروع نشط
 * @param {object} project - بيانات المشروع
 * @returns {boolean}
 */
export function isProjectActive(project) {
  return project && project.status === PROJECT_STATUS.ACTIVE;
}

/**
 * 📈 دالة الحصول على إحصائيات شاملة للمشروع
 * @param {object} project - بيانات المشروع
 */
export function getProjectStats(project) {
  if (!project) return null;
  
  return {
    name: project.name,
    status: project.status,
    subscribers: project.statistics?.totalSubscribers || 0,
    employees: project.statistics?.totalEmployees || 0,
    expenses: project.statistics?.totalExpenses || 0,
    revenue: project.statistics?.totalRevenue || 0,
    profit: (project.statistics?.totalRevenue || 0) - (project.statistics?.totalExpenses || 0),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

/**
 * 🔑 دالة تخزين بيانات المشروع الحالي محلياً
 * @param {object} project - بيانات المشروع
 */
export function setCurrentProject(project) {
  const projectData = {
    id: project.id,
    name: project.name,
    settings: project.settings,
    status: project.status
  };
  localStorage.setItem('currentProject', JSON.stringify(projectData));
}

/**
 * 🔍 دالة الحصول على بيانات المشروع الحالي
 * @returns {object}
 */
export function getCurrentProject() {
  const project = localStorage.getItem('currentProject');
  return project ? JSON.parse(project) : null;
}

/**
 * 🚀 دالة إنشاء مشروع افتراضي للاختبار
 * @param {object} db - Firestore instance
 * @param {string} adminUid - معرف الـ Admin
 */
export async function createDemoProject(db, adminUid) {
  return await createProject(db, {
    name: 'مياه قرية الحسينية',
    governorate: 'الحديدة',
    directorate: 'المنصورية',
    village: 'الحسينية',
    manager: 'كامل المهدي',
    managerPhone: '779551518',
    adminUid: adminUid,
    unitPrice: 150,
    subscriptionFee: 400
  });
}
