// ==========================================
// 1. قاعدة البيانات (المراكز الصحية)
// ==========================================
const centersData = {
    "مركز الفويهات الصحي": [{ name: "شلل الأطفال", count: 120, date: "2026-03-15" }, { name: "الخماسي", count: 35, date: "2026-03-18" }],
    "مركز بنغازي الطبي": [{ name: "شلل الأطفال", count: 200, date: "2026-03-20" }, { name: "الحصبة", count: 90, date: "2026-04-05" }],
    "مركز سيدي يونس الصحي": [{ name: "الثلاثي", count: 30, date: "2026-03-25" }],
    "مستشفى الأطفال": [{ name: "الحصبة", count: 100, date: "2026-04-05" }]
};

// ==========================================
// 2. نظام الحماية (العين والدخول)
// ==========================================
function togglePass(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

function showAuth(type) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if(loginForm && registerForm) {
        loginForm.style.display = type === 'login' ? 'block' : 'none';
        registerForm.style.display = type === 'register' ? 'block' : 'none';
        document.getElementById('tab-login').classList.toggle('active', type === 'login');
        document.getElementById('tab-register').classList.toggle('active', type === 'register');
    }
}

function registerUser() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const pass = document.getElementById('regPass').value;

    if (!name || !email || !pass || !phone) { alert("يرجى ملء كافة البيانات!"); return; }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.email === email)) { alert("هذا البريد مسجل مسبقاً!"); return; }

    const newUser = { name, email, phone, pass };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    alert("تم إنشاء حسابك بنجاح! ننتقل الآن للكتيب..");
    window.location.href = 'dashboard.html';
}

function loginUser() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPass').value;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const validUser = users.find(u => u.email === email && u.pass === pass);
    if (validUser) {
        localStorage.setItem('currentUser', JSON.stringify(validUser));
        alert("مرحباً بكِ مجدداً!");
        window.location.href = 'dashboard.html';
    } else {
        alert("بيانات الدخول غير صحيحة!");
    }
}

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user && (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('booking.html'))) {
        window.location.href = 'index.html';
    }
}

// ==========================================
// 3. إدارة بيانات الأطفال (مع الطباعة والتاريخ)
// ==========================================
function saveNewChild() {
    const name = document.getElementById('newChildName').value.trim();
    const birthDateValue = document.getElementById('birthDate').value;
    if (!name || !birthDateValue) { alert("أكملي البيانات!"); return; }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const newChild = {
        id: Date.now(),
        name: name,
        parentEmail: currentUser.email,
        birthDate: birthDateValue,
        bookingStatus: "لا يوجد حجز نشط",
        bookingLocation: "",
        bookingEntryDate: "", // سيتم تعبئته عند الحجز
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

function displayChildren() {
    const container = document.getElementById('childrenCardsContainer');
    if (!container) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allChildren = JSON.parse(localStorage.getItem('children')) || [];
    const userChildren = allChildren.filter(child => child.parentEmail === currentUser.email);
    
    container.innerHTML = userChildren.length ? '' : '<p style="text-align:center; padding:20px;">لا يوجد أطفال مسجلين.</p>';
    
    userChildren.forEach(child => {
        const card = document.createElement('div');
        card.className = 'child-card';
        
        let vRows = '';
        child.vaccinations.forEach(v => {
            vRows += `<tr><td>${v.name}</td><td>${v.date}</td><td><span class="${v.status === 'تم أخذها' ? 'status-done' : 'status-upcoming'}">${v.status}</span></td></tr>`;
        });

        const bookingInfo = child.bookingEntryDate ? 
            `<div style="background:#f0f9ff; padding:10px; border-radius:8px; margin:10px 0; border-right:4px solid #10b981;">
                <p style="margin:0; font-weight:bold;">📍 ${child.bookingLocation}</p>
                <p style="margin:0; font-size:0.85rem; color:#64748b;">📅 تاريخ الحجز: ${child.bookingEntryDate}</p>
            </div>` : '';

        card.innerHTML = `
            <div class="print-header-official" style="display:none; text-align:center; border-bottom:2px solid #333; margin-bottom:15px; padding-bottom:10px;">
                <h2 style="margin:0;">دولة ليبيا - وزارة الصحة</h2>
                <h3 style="margin:5px 0;">كتيب التطعيمات الإلكتروني الرسمي</h3>
                <p>تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-LY')}</p>
            </div>

            <h3 style="color:var(--primary);"><i class="fa-solid fa-baby"></i> الطفل: ${child.name}</h3>
            <p><b>تاريخ الميلاد:</b> ${child.birthDate}</p>
            <p><b>الحالة:</b> <span style="color:#10b981; font-weight:bold;">${child.bookingStatus}</span></p>
            
            ${bookingInfo}

            <div class="table-wrapper">
                <table>
                    <thead><tr><th>التطعيم</th><th>التاريخ</th><th>الحالة</th></tr></thead>
                    <tbody>${vRows}</tbody>
                </table>
            </div>

            <div class="no-print" style="margin-top:20px; display:flex; gap:10px;">
                <button onclick="window.print()" class="btn-small" style="background:#10b981; color:white; flex:2; border:none; padding:10px; border-radius:8px; cursor:pointer;">
                    <i class="fa-solid fa-print"></i> طباعة الكتيب PDF
                </button>
                <button onclick="deleteChild(${child.id})" class="btn-small btn-danger" style="flex:1;">حذف</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// ==========================================
// 4. نظام الحجز (التاريخ والجدول التلقائي)
// ==========================================
function confirmBooking() {
    const childId = document.getElementById('childSelect')?.value;
    const center = document.getElementById('centerSelect')?.value;
    const selectedVac = document.querySelector('input[name="selectedVaccine"]:checked')?.value;

    if (!childId || !center || !selectedVac) { alert("أكملي خيارات الحجز!"); return; }

    let children = JSON.parse(localStorage.getItem('children')) || [];
    const idx = children.findIndex(c => c.id == childId);

    if (idx !== -1) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const bookingDate = new Date().toLocaleDateString('ar-LY'); // تاريخ الحجز اليوم

        const templateParams = {
            child_name: children[idx].name,
            parent_email: currentUser.email,
            phone_number: currentUser.phone,
            center_name: center,
            vaccine: selectedVac
        };

        emailjs.send("service_b8wk5cq", "template_qrm8pcn", templateParams)
            .then(() => {
                children[idx].bookingStatus = `محجوز لـ (${selectedVac})`;
                children[idx].bookingLocation = center;
                children[idx].bookingEntryDate = bookingDate;
                localStorage.setItem('children', JSON.stringify(children));
                alert("تم الحجز بنجاح!");
                window.location.href = 'dashboard.html';
            })
            .catch(() => {
                children[idx].bookingStatus = `محجوز لـ (${selectedVac})`;
                children[idx].bookingLocation = center;
                children[idx].bookingEntryDate = bookingDate;
                localStorage.setItem('children', JSON.stringify(children));
                window.location.href = 'dashboard.html';
            });
    }
}

// ==========================================
// 5. تهيئة الصفحات
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    if (document.getElementById('childrenCardsContainer')) displayChildren();
    
    const childSelect = document.getElementById('childSelect');
    const centerSelect = document.getElementById('centerSelect');

    if(childSelect) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const kids = (JSON.parse(localStorage.getItem('children')) || []).filter(c => c.parentEmail === user.email);
        childSelect.innerHTML = '<option value="" disabled selected>-- اختاري الطفل --</option>';
        kids.forEach(k => childSelect.innerHTML += `<option value="${k.id}">${k.name}</option>`);
    }

    if(centerSelect) {
        centerSelect.innerHTML = '<option value="" disabled selected>-- اختاري المركز --</option>';
        Object.keys(centersData).forEach(c => centerSelect.innerHTML += `<option value="${c}">${c}</option>`);
        
        centerSelect.addEventListener('change', function() {
            const vaccines = centersData[this.value];
            const bookingOptions = document.getElementById('bookingOptions');
            if (vaccines && bookingOptions) {
                let html = `<p style="margin:10px 0; font-weight:bold; color:var(--primary);">التطعيمات المتاحة:</p>
                <div class="table-wrapper"><table><thead><tr><th>اختيار</th><th>التطعيم</th><th>العدد</th><th>التاريخ</th></tr></thead><tbody>`;
                vaccines.forEach((v, i) => {
                    html += `<tr><td><input type="radio" name="selectedVaccine" value="${v.name}" id="v${i}"></td><td>${v.name}</td><td>${v.count}</td><td style="color:red; font-weight:bold;">${v.date}</td></tr>`;
                });
                html += `</tbody></table></div><button onclick="confirmBooking()" class="btn" style="width:100%; margin-top:15px;">تأكيد الحجز ✅</button>`;
                bookingOptions.innerHTML = html;
            }
        });
    }
});

function deleteChild(id) {
    if (confirm("هل أنت متأكدة؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        localStorage.setItem('children', JSON.stringify(children.filter(c => c.id !== id)));
        location.reload();
    }
}
