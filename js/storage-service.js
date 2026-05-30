// خدمة تخزين البيانات المحلية
export const storageService = {
    // حفظ البيانات
    save: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            return false;
        }
    },

    // جلب البيانات
    get: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('خطأ في جلب البيانات:', error);
            return null;
        }
    },

    // حذف البيانات
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('خطأ في حذف البيانات:', error);
            return false;
        }
    },

    // مسح جميع البيانات
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('خطأ في مسح البيانات:', error);
            return false;
        }
    },

    // التحقق من وجود المفتاح
    exists: (key) => {
        return localStorage.getItem(key) !== null;
    },

    // الحصول على جميع البيانات
    getAll: () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = storageService.get(key);
        }
        return data;
    },

    // حفظ مع تاريخ انتهاء الصلاحية
    setWithExpiry: (key, data, expiryHours = 24) => {
        const expiryTime = new Date().getTime() + (expiryHours * 60 * 60 * 1000);
        const item = { data, expiry: expiryTime };
        return storageService.save(key, item);
    },

    // جلب البيانات مع التحقق من الصلاحية
    getWithExpiry: (key) => {
        const item = storageService.get(key);
        if (!item) return null;
        
        if (new Date().getTime() > item.expiry) {
            storageService.remove(key);
            return null;
        }
        
        return item.data;
    }
};