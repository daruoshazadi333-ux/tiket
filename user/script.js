// ============================================================
// 📦 داده‌ها
// ============================================================
let tickets = JSON.parse(localStorage.getItem('tickets')) || [];

// ============================================================
// 🎯 المان‌ها
// ============================================================
const ticketList = document.getElementById('ticketList');
const ticketCount = document.getElementById('ticketCount');
const userName = document.getElementById('userName');
const ticketSubject = document.getElementById('ticketSubject');
const ticketMessage = document.getElementById('ticketMessage');
const submitTicketBtn = document.getElementById('submitTicketBtn');

// ============================================================
// 🔧 توابع کمکی
// ============================================================

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generateId() {
    return 'TK-' + String(Date.now()).slice(-6) + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
}

function getStatusText(status) {
    return status === 'open' ? 'باز' : 'بسته';
}

// ============================================================
// 📋 رندر تیکت‌ها
// ============================================================

function renderTickets() {
    if (tickets.length === 0) {
        ticketList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>هنوز تیکتی ثبت نشده</p>
                <p style="font-size:13px;margin-top:6px;">اولین تیکت خود را ثبت کنید</p>
            </div>
        `;
        ticketCount.textContent = '0 تیکت';
        return;
    }

    const sorted = [...tickets].reverse();
    ticketList.innerHTML = sorted.map((t, index) => {
        const realIndex = tickets.length - 1 - index;
        const date = new Date(t.date);
        const persianDate = date.toLocaleDateString('fa-IR');
        const persianTime = date.toLocaleTimeString('fa-IR');
        
        let answerHTML = '';
        if (t.answer) {
            answerHTML = `
                <div class="ticket-answer">
                    <strong><i class="fas fa-reply"></i> پاسخ ادمین:</strong>
                    <p style="margin-top:6px;">${escapeHTML(t.answer)}</p>
                </div>
            `;
        }

        return `
            <div class="ticket-item">
                <div class="ticket-header">
                    <div>
                        <div class="ticket-title">${escapeHTML(t.subject)}</div>
                        <div class="ticket-user">
                            <i class="fas fa-user"></i> ${escapeHTML(t.userName || 'ناشناس')}
                        </div>
                    </div>
                    <span class="ticket-status ${t.status}">${getStatusText(t.status)}</span>
                </div>
                <div class="ticket-desc">${escapeHTML(t.message)}</div>
                ${answerHTML}
                <div class="ticket-meta">
                    <span class="ticket-date">
                        <i class="far fa-calendar-alt"></i> ${persianDate} - ${persianTime}
                    </span>
                    <span style="font-size:11px;color:rgba(255,255,255,0.15);">${t.id}</span>
                </div>
            </div>
        `;
    }).join('');

    ticketCount.textContent = tickets.length + ' تیکت';
}

// ============================================================
// 👤 ثبت تیکت
// ============================================================

submitTicketBtn.addEventListener('click', function() {
    const name = userName.value.trim() || 'ناشناس';
    const subject = ticketSubject.value.trim();
    const message = ticketMessage.value.trim();

    if (!subject || !message) {
        alert('⚠️ لطفاً موضوع و متن تیکت را وارد کنید');
        if (!subject) ticketSubject.style.borderColor = '#ef4444';
        if (!message) ticketMessage.style.borderColor = '#ef4444';
        setTimeout(() => {
            ticketSubject.style.borderColor = '';
            ticketMessage.style.borderColor = '';
        }, 1000);
        return;
    }

    tickets.push({
        id: generateId(),
        userName: name,
        subject: subject,
        message: message,
        date: Date.now(),
        status: 'open',
        answer: null,
        answerDate: null
    });

    localStorage.setItem('tickets', JSON.stringify(tickets));
    renderTickets();
    
    ticketSubject.value = '';
    ticketMessage.value = '';
    ticketList.scrollIntoView({ behavior: 'smooth', block: 'end' });
});

// ============================================================
// ⏱️ بروزرسانی خودکار
// ============================================================

setInterval(() => {
    const saved = JSON.parse(localStorage.getItem('tickets')) || [];
    if (JSON.stringify(saved) !== JSON.stringify(tickets)) {
        tickets = saved;
        renderTickets();
    }
}, 5000);

// ============================================================
// 🚀 شروع
// ============================================================

renderTickets();
console.log('🎫 سیستم تیکتینگ - کاربر');
console.log('📦 تعداد تیکت‌ها:', tickets.length);