// --- 1. قاعدة البيانات ---
const centersData = {
    "مركز الفويهات الصحي": [{ name: "شلل الأطفال", count: 120, date: "2026-03-15" }, { name: "الخماسي", count: 35, date: "2026-03-18" }],
    "مركز بنغازي الطبي": [{ name: "شلل الأطفال", count: 200, date: "2026-03-20" }, { name: "الحصبة", count: 90, date: "2026-04-05" }],
    "مركز سيدي يونس الصحي": [{ name: "الثلاثي", count: 30, date: "2026-03-25" }],
    "مستشفى الأطفال": [{ name: "الحصبة", count: 100, date: "2026-04-05" }]
};

// --- 2. نظام تسجيل الدخول (طلب الأستاذة) ---
function showAuth(type) {
    document.getElementById('loginForm').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = type === 'register' ? 'block' : 'none';
    document.getElementById('tab-login').classList.toggle('active', type === 'login');
    document.getElementById('tab-register').classList.toggle('active', type === 'register');
}

function registerUser() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const pass = document.getElementById('regPass').value;

    if (!name || !email || !pass) { alert("يرجى ملء البيانات!"); return; }

    const user = { name, email, phone, pass };
    localStorage.setItem('currentUser', JSON.stringify(user));
    alert("تم إنشاء حسابك بنجاح يا " + name + "! يمكنك الآن إضافة أطفالك.");
    window.location.href = 'dashboard.html';
}

function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));

    if (storedUser && storedUser.email === email && storedUser.pass === pass) {
        alert("مرحباً بكِ مجدداً!");
        window.location.href = 'dashboard.html';
    } else {
        alert("بيانات الدخول غير صحيحة!");
    }
}

// حماية الصفحات: منع الدخول للكتيب بدون تسجيل
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    const currentPage = window.location.pathname;
    if (!user && (currentPage.includes('dashboard.html') || currentPage.includes('booking.html'))) {
        alert("الرجاء تسجيل الدخول أولاً!");
        window.location.href = 'index.html';
    }
}

// --- 3. إدارة بيانات الأطفال ---
function saveNewChild() {
    const name = document.getElementById('newChildName').value.trim();
    const birthDateValue = document.getElementById('birthDate').value;
    const today = new Date().toISOString().split('T')[0];

    if (!name || !birthDateValue) { alert("أكملي البيانات!"); return; }
    if (birthDateValue > today) { alert("خطأ: التاريخ في المستقبل!"); return; }

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const newChild = {
        id: Date.now(),
        name: name,
        parentEmail: user.email, // ربط تلقائي بإيميل الأم
        parentPhone: user.phone, // ربط تلقائي برقم الأم
        birthDate: birthDateValue,
        bookingStatus: "لا يوجد حجز نشط",
        vaccinations: [
            { name: "عند الولادة", status: "تم أخذها", date: birthDateValue },
            { name: "شهرين", status: "قادم", date: "معلق" },
            { name: "4 أشهر", status: "قادم", date: "معلق" }
        ]
    };

    let children = JSON.parse(localStorage.getItem('children')) || [];
    children.push(newChild);
    localStorage.setItem('children', JSON.stringify(children));
    alert("تم تسجيل الطفل بنجاح! 🌸");
    location.reload();
}

// --- 4. نظام الحجز وإرسال الإيميل ---
function confirmBooking() {
    const childId = document.getElementById('childSelect')?.value;
    const center = document.getElementById('centerSelect')?.value;
    const selectedVac = document.querySelector('input[name="selectedVaccine"]:checked')?.value;

    if (!childId || !center || !selectedVac) { alert("اختاري الطفل والمركز والتطعيمة!"); return; }

    let children = JSON.parse(localStorage.getItem('children')) || [];
    const childIndex = children.findIndex(c => c.id == childId);

    if (childIndex !== -1) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const templateParams = {
            child_name: children[childIndex].name,
            parent_email: user.email,
            phone_number: user.phone,
            center_name: center,
            vaccine: selectedVac
        };

        emailjs.send("service_b8wk5cq", "template_qrm8pcn", templateParams)
            .then(() => {
                children[childIndex].bookingStatus = `محجوز لـ (${selectedVac}) في: ${center}`;
                localStorage.setItem('children', JSON.stringify(children));
                alert("تم الحجز! ستصلك رسالة تأكيد على إيميلك: " + user.email);
                window.location.href = 'dashboard.html';
            }, (err) => {
                alert("تم الحجز محلياً، فشل الإرسال للإيميل.");
            });
    }
}

// --- 5. تهيئة الصفحات ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    if (document.getElementById('childrenCardsContainer')) displayChildren();
    if (document.getElementById('childSelect')) populateChildSelect();
});

// باقي الدوال (displayChildren, deleteChild, populateChildSelect, markAsDone) تبقى كما هي
function populateChildSelect() {
    const select = document.getElementById('childSelect');
    if(!select) return;
    const children = JSON.parse(localStorage.getItem('children')) || [];
    select.innerHTML = '<option value="" disabled selected>-- اختر الطفل --</option>';
    children.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        select.appendChild(opt);
    });
}

function displayChildren() {
    const container = document.getElementById('childrenCardsContainer');
    if (!container) return;
    const children = JSON.parse(localStorage.getItem('children')) || [];
    container.innerHTML = children.length ? '' : '<p>لا يوجد أطفال مسجلين حالياً.</p>';
    children.forEach(child => {
        const card = document.createElement('div');
        card.className = 'child-card';
        card.innerHTML = `<h3>الطفل: ${child.name}</h3><p>تاريخ الميلاد: ${child.birthDate}</p><p style="color:green;">${child.bookingStatus}</p><button onclick="deleteChild(${child.id})" class="btn-small btn-danger">حذف</button>`;
        container.appendChild(card);
    });
}

function deleteChild(id) {
    if (confirm("حذف السجل؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        localStorage.setItem('children', JSON.stringify(children.filter(c => c.id !== id)));
        location.reload();
    }
}
