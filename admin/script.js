// ============================================================
// 🔐 رمز ادمین
// ============================================================
const ADMIN_PASSWORD = "123456789";

// ============================================================
// 📦 داده‌ها
// ============================================================
let tickets = JSON.parse(localStorage.getItem('tickets')) || [];
let isLoggedIn = false;
let currentFilter = 'all';

// ============================================================
// 🎯 المان‌ها
// ============================================================
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const adminPassword = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const ticketList = document.getElementById('ticketList');
const ticketCount = document.getElementById('ticketCount');
const filterAll = document.getElementById('filterAll');
const filterOpen = document.getElementById('filterOpen');
const filterClosed = document.getElementById('filterClosed');

// ============================================================
// 🔧 توابع کمکی
// ============================================================

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStatusText(status) {
    return status === 'open' ? 'باز' : 'بسته';
}

function showDashboard() {
    loginPage.style.display = 'none';
    dashboardPage.style.display = 'block';
    renderTickets();
}

function showLogin() {
    loginPage.style.display = 'block';
    dashboardPage.style.display = 'none';
    isLoggedIn = false;
}

// ============================================================
// 📋 رندر تیکت‌ها
// ============================================================

function renderTickets() {
    let filtered = tickets;
    if (currentFilter === 'open') {
        filtered = tickets.filter(t => t.status === 'open');
    } else if (currentFilter === 'closed') {
        filtered = tickets.filter(t => t.status === 'closed');
    }

    if (filtered.length === 0) {
        ticketList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>هیچ تیکتی در این دسته نیست</p>
            </div>
        `;
        ticketCount.textContent = tickets.length + ' تیکت';
        return;
    }

    const sorted = [...filtered].reverse();
    ticketList.innerHTML = sorted.map((t, index) => {
        const realIndex = tickets.indexOf(t);
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
                <div class="ticket-actions">
                    ${t.status === 'open' ? `
                        <button class="btn btn-sm btn-primary" onclick="showAnswerForm(${realIndex})">
                            <i class="fas fa-reply"></i> پاسخ
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="closeTicket(${realIndex})">
                            <i class="fas fa-times"></i> بستن
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-success" onclick="reopenTicket(${realIndex})">
                            <i class="fas fa-undo"></i> بازگشایی
                        </button>
                    `}
                    <button class="btn btn-sm btn-danger" onclick="deleteTicket(${realIndex})">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
                <div class="answer-form" id="answerForm_${realIndex}">
                    <textarea id="answerText_${realIndex}" placeholder="متن پاسخ ..."></textarea>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-sm btn-success" onclick="submitAnswer(${realIndex})">
                            <i class="fas fa-check"></i> ارسال پاسخ
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="hideAnswerForm(${realIndex})">
                            انصراف
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    ticketCount.textContent = tickets.length + ' تیکت';
}

// ============================================================
// 🔐 ورود
// ============================================================

loginBtn.addEventListener('click', function() {
    const password = adminPassword.value.trim();
    
    if (!password) {
        loginError.textContent = '⚠️ لطفاً رمز را وارد کنید';
        return;
    }

    if (password === ADMIN_PASSWORD) {
        isLoggedIn = true;
        loginError.textContent = '';
        adminPassword.value = '';
        showDashboard();
    } else {
        loginError.textContent = '❌ رمز اشتباه است';
        adminPassword.value = '';
        adminPassword.focus();
        adminPassword.style.borderColor = '#ef4444';
        setTimeout(() => {
            adminPassword.style.borderColor = '';
        }, 1000);
    }
});

adminPassword.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

// ============================================================
// 🚪 خروج
// ============================================================

logoutBtn.addEventListener('click', function() {
    showLogin();
    adminPassword.value = '';
    loginError.textContent = '';
});

// ============================================================
// 🛠️ عملیات روی تیکت‌ها
// ============================================================

window.showAnswerForm = function(index) {
    const form = document.getElementById('answerForm_' + index);
    if (form) {
        form.classList.toggle('active');
        const textarea = document.getElementById('answerText_' + index);
        if (textarea) textarea.focus();
    }
};

window.hideAnswerForm = function(index) {
    const form = document.getElementById('answerForm_' + index);
    if (form) {
        form.classList.remove('active');
        const textarea = document.getElementById('answerText_' + index);
        if (textarea) textarea.value = '';
    }
};

window.submitAnswer = function(index) {
    const textarea = document.getElementById('answerText_' + index);
    const answer = textarea.value.trim();
    
    if (!answer) {
        alert('⚠️ لطفاً متن پاسخ را وارد کنید');
        textarea.style.borderColor = '#ef4444';
        setTimeout(() => textarea.style.borderColor = '', 1000);
        return;
    }

    tickets[index].answer = answer;
    tickets[index].answerDate = Date.now();
    tickets[index].status = 'closed';
    
    localStorage.setItem('tickets', JSON.stringify(tickets));
    renderTickets();
};

window.closeTicket = function(index) {
    if (confirm('آیا از بستن این تیکت مطمئن هستید؟')) {
        tickets[index].status = 'closed';
        localStorage.setItem('tickets', JSON.stringify(tickets));
        renderTickets();
    }
};

window.reopenTicket = function(index) {
    tickets[index].status = 'open';
    localStorage.setItem('tickets', JSON.stringify(tickets));
    renderTickets();
};

window.deleteTicket = function(index) {
    if (confirm('⚠️ آیا از حذف این تیکت مطمئن هستید؟')) {
        tickets.splice(index, 1);
        localStorage.setItem('tickets', JSON.stringify(tickets));
        renderTickets();
    }
};

// ============================================================
// 🔍 فیلترها
// ============================================================

filterAll.addEventListener('click', function() {
    currentFilter = 'all';
    document.querySelectorAll('.filter-group .btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    renderTickets();
});

filterOpen.addEventListener('click', function() {
    currentFilter = 'open';
    document.querySelectorAll('.filter-group .btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    renderTickets();
});

filterClosed.addEventListener('click', function() {
    currentFilter = 'closed';
    document.querySelectorAll('.filter-group .btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    renderTickets();
});

// ============================================================
// ⏱️ بروزرسانی خودکار
// ============================================================

setInterval(() => {
    const saved = JSON.parse(localStorage.getItem('tickets')) || [];
    if (JSON.stringify(saved) !== JSON.stringify(tickets)) {
        tickets = saved;
        if (isLoggedIn) {
            renderTickets();
        }
    }
}, 5000);

// ============================================================
// 🚀 شروع
// ============================================================

showLogin();
console.log('🔐 پنل ادمین');
console.log('🔑 رمز: 123456789');