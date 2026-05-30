// خدمة المحاسبة المالية
export const accountingService = {
    // حساب الرصيد المالي للمشترك
    calculateSubscriberBalance: (subscriber) => {
        const paid = subscriber.paid || 0;
        const charged = subscriber.charged || 0;
        const balance = paid - charged;
        return {
            balance,
            status: balance >= 0 ? 'مدين' : 'دائن',
            amount: Math.abs(balance)
        };
    },

    // حساب الفائدة الشهرية
    calculateMonthlyInterest: (amount, rate = 0.05) => {
        return amount * rate;
    },

    // حساب إجمالي المصروفات
    calculateTotalExpenses: (expenses) => {
        return expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
    },

    // حساب صافي الأرباح
    calculateNetProfit: (totalIncome, totalExpenses) => {
        return totalIncome - totalExpenses;
    },

    // حساب متوسط استهلاك المشترك
    calculateAverageUsage: (readings) => {
        if (readings.length === 0) return 0;
        const total = readings.reduce((sum, reading) => sum + (reading.usage || 0), 0);
        return (total / readings.length).toFixed(2);
    },

    // حساب قيمة الفاتورة
    calculateBillAmount: (usage, pricePerUnit = 500) => {
        return usage * pricePerUnit;
    },

    // إنشاء تقرير مالي شهري
    generateMonthlyReport: (data) => {
        return {
            month: new Date().toLocaleString('ar-EG', { month: 'long', year: 'numeric' }),
            totalSubscribers: data.subscribers || 0,
            totalIncome: data.totalIncome || 0,
            totalExpenses: data.totalExpenses || 0,
            netProfit: (data.totalIncome || 0) - (data.totalExpenses || 0),
            totalUsage: data.totalUsage || 0,
            averageUsage: data.averageUsage || 0,
            generatedDate: new Date().toISOString()
        };
    },

    // تحويل العملة
    convertCurrency: (amount, fromRate = 1, toRate = 1) => {
        return (amount / fromRate) * toRate;
    },

    // حساب نسبة الربح
    calculateProfitMargin: (revenue, expenses) => {
        if (revenue === 0) return 0;
        return ((revenue - expenses) / revenue * 100).toFixed(2);
    }
};