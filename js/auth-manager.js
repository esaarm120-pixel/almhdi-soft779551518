// js/auth-manager.js

export function protectPage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    // 1. إذا لم يكن هناك مستخدم، ارسله لصفحة الدخول
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // 2. إذا كان المستخدم "سوبر أدمن"، اسمح له بالدخول لأي صفحة فوراً
    if (user.role === 'super_admin') {
        return;
    }

    // 3. إذا كان مستخدماً عادياً، امنعه من دخول الصفحات الإدارية
    alert("❌ ليس لديك صلاحية للوصول لهذه الصفحة!");
    window.location.href = 'dashboard.html';
}

export async function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
