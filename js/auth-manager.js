// js/auth-manager.js

export function protectPage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    // المعرف الثاني الخاص بك
    const SUPER_ADMIN_UID = "YtP6bjTz6HrwJbVhJNJH"; 

    // 1. إذا لم يكن هناك مستخدم، ارسله لصفحة الدخول
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // 2. التحقق من الصلاحية (إما بالدور المحفوظ أو بالمعرف الخاص بك)
    if (user.role === 'super_admin' || user.uid === SUPER_ADMIN_UID) {
        console.log("تم تفعيل وضع السوبر أدمن");
        return; // أنت السوبر أدمن، استمر!
    }

    // 3. إذا لم تكن سوبر أدمن، امنعه
    alert("❌ ليس لديك صلاحية للوصول لهذه الصفحة!");
    window.location.href = 'dashboard.html';
}

export async function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
