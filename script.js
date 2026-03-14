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
// 2. نظام الحماية والخصوصية
// ==========================================
function togglePass(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input && icon) {
        if (input.type === "password") {
            input.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            input.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");
        }
    }
}

function showAuth(type) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    if(loginForm && registerForm) {
        loginForm.style.display = type === 'login' ? 'block' : 'none';
        registerForm.style.display = type === 'register' ? 'block' : 'none';
        if(tabLogin) tabLogin.classList.toggle('active', type === 'login');
        if(tabRegister) tabRegister.classList.toggle('active', type === 'register');
    }
}

function registerUser() {
    const name = document.getElementById('regName')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim();
    const phone = document.getElementById('regPhone')?.value.trim();
    const pass = document.getElementById('regPass')?.value;

    if (!name || !email || !pass || !phone) { alert("يرجى ملء كافة البيانات!"); return; }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.email === email)) { alert("هذا البريد مسجل مسبقاً!"); return; }

    const newUser = { name, email, phone, pass };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    alert("تم إنشاء حسابك بنجاح!");
    window.location.href = 'dashboard.html';
}

function loginUser() {
    const email = document.getElementById('loginEmail')?.value.trim();
    const pass = document.getElementById('loginPass')?.value;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const validUser = users.find(u => u.email === email && u.pass === pass);
    if (validUser) {
        localStorage.setItem('currentUser', JSON.stringify(validUser));
        window.location.href = 'dashboard.html';
    } else {
        alert("بيانات الدخول غير صحيحة!");
    }
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    const path = window.location.pathname;
    if (!user && (path.includes('dashboard.html') || path.includes('booking.html'))) {
        window.location.href = 'index.html';
    }
}

// ==========================================
// 3. إدارة بيانات الأطفال (حل مشكلة 2028 والتعليق)
// ==========================================
function saveNewChild() {
    const nameInput = document.getElementById('newChildName');
    const dateInput = document.getElementById('birthDate');

    if (!nameInput || !dateInput) return;

    const name = nameInput.value.trim();
    const birthDateValue = dateInput.value;
    
    const today = new Date();
    const selectedDate = new Date(birthDateValue);

    if (!name || !birthDateValue) { 
        alert("من فضلكِ، أدخلي اسم الطفل وتاريخ الميلاد!"); 
        return; 
    }

    if (selectedDate > today) {
        alert("خطأ: لا يمكن تسجيل تاريخ ميلاد في المستقبل (مثل 2027). يرجى تصحيح التاريخ.");
        return; 
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(!currentUser) { alert("يرجى تسجيل الدخول أولاً"); return; }

    const newChild = {
        id: Date.now(),
        name: name,
        parentEmail: currentUser.email,
        birthDate: birthDateValue,
        bookingStatus: "لا يوجد حجز نشط",
        bookingLocation: "",
        bookingEntryDate: "",
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
    if (!currentUser) return;

    const allChildren = JSON.parse(localStorage.getItem('children')) || [];
    const userChildren = allChildren.filter(child => child.parentEmail === currentUser.email);
    
    container.innerHTML = userChildren.length ? '' : '<p style="text-align:center; padding:20px;">لا يوجد أطفال مسجلين حالياً.</p>';
    
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
            <div class="print-header-official" style="display:none;">
                <h2 style="text-align:center;">دولة ليبيا - وزارة الصحة</h2>
                <h3 style="text-align:center;">كتيب التطعيمات الإلكتروني</h3>
                <hr>
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
// 4. نظام الحجز
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
        const bookingDate = new Date().toLocaleDateString('ar-LY');

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
// 5. تهيئة الصفحات (Initialization)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // تشغيل العرض إذا كنا في صفحة الكتيب
    if (document.getElementById('childrenCardsContainer')) {
        displayChildren();
    }
    
    // إعداد القوائم إذا كنا في صفحة الحجز
    const childSelect = document.getElementById('childSelect');
    const centerSelect = document.getElementById('centerSelect');

    if(childSelect) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if(user) {
            const kids = (JSON.parse(localStorage.getItem('children')) || []).filter(c => c.parentEmail === user.email);
            childSelect.innerHTML = '<option value="" disabled selected>-- اختاري الطفل --</option>';
            kids.forEach(k => {
                const opt = document.createElement('option');
                opt.value = k.id;
                opt.textContent = k.name;
                childSelect.appendChild(opt);
            });
        }
    }

    if(centerSelect) {
        centerSelect.innerHTML = '<option value="" disabled selected>-- اختاري المركز --</option>';
        Object.keys(centersData).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            centerSelect.appendChild(opt);
        });
        
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
    if (confirm("هل أنتِ متأكدة من حذف هذا السجل؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        localStorage.setItem('children', JSON.stringify(children.filter(c => c.id !== id)));
        location.reload();
    }
}
