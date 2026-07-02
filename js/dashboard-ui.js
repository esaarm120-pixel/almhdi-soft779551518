import { subscriberService } from "./subscriber-service.js";
import { expenseService } from "./expense-service.js";
import { /* You can import other services as needed */ } from "./utils.js";

async function updateStats(){
  try{
    // المشتركين
    const totalSubs = await subscriberService.getTotalSubscribers();
    const subsEl = document.getElementById('subscribers-count');
    if(subsEl) subsEl.textContent = totalSubs;

    // المصروفات الإجمالية
    let totalExpenses = 0;
    try{ totalExpenses = await expenseService.getTotalExpenses(); }catch(e){ console.warn('expense total failed', e); }
    const expensesEl = document.getElementById('expenses-total');
    if(expensesEl) expensesEl.textContent = (parseFloat(totalExpenses)||0) + ' ريال يمني';

    // إيرادات مؤقتة (إن لم توجد خدمة اجعلها 0) — يمكنك ربطها لاحقاً بخدمة الفواتير/القبوض
    const revenueEl = document.getElementById('revenue-total');
    if(revenueEl) revenueEl.textContent = '0 ريال يمني';

    // قراءات/فواتير/قبوض/مصروفات عددية (إن وُجدت خدمات لها، اربطها هنا)
    const readingsEl = document.getElementById('readings-count');
    if(readingsEl) readingsEl.textContent = '0';

    const invoicesEl = document.getElementById('invoices-count');
    if(invoicesEl) invoicesEl.textContent = '0';

    const receiptsEl = document.getElementById('receipts-count');
    if(receiptsEl) receiptsEl.textContent = '0';

    const paymentsEl = document.getElementById('payments-count');
    if(paymentsEl) paymentsEl.textContent = '0';

  }catch(err){
    console.error('Failed to update dashboard stats', err);
  }
}

window.addEventListener('DOMContentLoaded', ()=>{
  updateStats();

  // Action buttons can open modals or navigate to pages — simple placeholders:
  document.getElementById('action-add-subscriber')?.addEventListener('click', ()=>{ window.location.href = 'manage-users.html'; });
  document.getElementById('action-add-expense')?.addEventListener('click', ()=>{ window.location.href = 'expenses.html'; });
  document.getElementById('action-add-reading')?.addEventListener('click', ()=>{ window.location.href = 'readings.html'; });
  document.getElementById('action-add-receipt')?.addEventListener('click', ()=>{ window.location.href = 'receipt.html'; });
  document.getElementById('action-add-cashbox')?.addEventListener('click', ()=>{ window.location.href = 'admin-dashboard.html'; });
});
