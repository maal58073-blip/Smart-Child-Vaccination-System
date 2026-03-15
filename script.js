// ==========================================
// 1. قاعدة البيانات (المراكز الصحية مع دعم التحديث)
// ==========================================
// نقوم بجلب البيانات من localStorage إذا وجدت، وإلا نستخدم البيانات الافتراضية
if (!localStorage.getItem('centersData')) {
    const initialCenters = {
        "مركز الفويهات الصحي": [{ name: "شلل الأطفال", count: 120, date: "2026-03-15" }, { name: "الخماسي", count: 35, date: "2026-03-18" }],
        "مركز بنغازي الطبي": [{ name: "شلل الأطفال", count: 200, date: "2026-03-20" }, { name: "الحصبة", count: 90, date: "2026-04-05" }],
        "مركز سيدي يونس الصحي": [{ name: "الثلاثي", count: 30, date: "2026-03-25" }],
        "مستشفى الأطفال": [{ name: "الحصبة", count: 100, date: "2026-04-05" }]
    };
    localStorage.setItem('centersData', JSON.stringify(initialCenters));
}

let centersData = JSON.parse(localStorage.getItem('centersData'));

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

// تعديل 1: وظيفة استعادة كلمة المرور
function forgotPassword() {
    const email = prompt("الرجاء إدخال بريدكِ الإلكتروني المسجل لاستعادة كلمة المرور:");
    if (!email) return;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex !== -1) {
        const newPass = prompt("تم العثور على حسابكِ. أدخلي كلمة المرور الجديدة:");
        if (newPass && newPass.length >= 4) {
            users[userIndex].pass = newPass;
            localStorage.setItem('users', JSON.stringify(users));
            alert("تم تحديث كلمة المرور بنجاح! يمكنكِ الآن تسجيل الدخول.");
        } else {
            alert("كلمة المرور قصيرة جداً أو غير صالحة.");
        }
    } else {
        alert("عذراً، هذا البريد غير مسجل في المنظومة.");
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
// 3. إدارة بيانات الأطفال
// ==========================================
function saveNewChild() {
    const nameInput = document.getElementById('newChildName');
    const dateInput = document.getElementById('birthDate');
    if (!nameInput || !dateInput) return;

    const name = nameInput.value.trim();
    const birthDateValue = dateInput.value;
    const today = new Date();
    const selectedDate = new Date(birthDateValue);

    if (!name || !birthDateValue) { alert("من فضلكِ، أدخلي اسم الطفل وتاريخ الميلاد!"); return; }

    if (selectedDate > today) {
        alert("خطأ: لا يمكن تسجيل تاريخ ميلاد في المستقبل. يرجى تصحيح التاريخ.");
        return; 
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(!currentUser) return;

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

// تعديل 3: دالة لتحديث حالة التطعيم يدوياً من قبل الأم
function markAsDone(childId, vacName) {
    let children = JSON.parse(localStorage.getItem('children')) || [];
    const childIdx = children.findIndex(c => c.id == childId);
    
    if (childIdx !== -1) {
        const vacIdx = children[childIdx].vaccinations.findIndex(v => v.name === vacName);
        if (vacIdx !== -1) {
            children[childIdx].vaccinations[vacIdx].status = "تم أخذها";
            children[childIdx].vaccinations[vacIdx].date = new Date().toLocaleDateString('ar-LY');
            // تنظيف بيانات الحجز بعد الانتهاء
            children[childIdx].bookingStatus = "لا يوجد حجز نشط";
            children[childIdx].bookingLocation = "";
            children[childIdx].bookingEntryDate = "";
            
            localStorage.setItem('children', JSON.stringify(children));
            alert("الحمد لله على سلامة طفلكِ! تم تحديث الكتيب بنجاح. ❤️");
            displayChildren();
        }
    }
}

function displayChildren() {
    const container = document.getElementById('childrenCardsContainer');
    if (!container) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allChildren = JSON.parse(localStorage.getItem('children')) || [];
    const userChildren = allChildren.filter(child => child.parentEmail === currentUser.email);
    
    container.innerHTML = userChildren.length ? '' : '<p style="text-align:center; padding:20px;">لا يوجد أطفال مسجلين حالياً.</p>';
    
    userChildren.forEach(child => {
        const card = document.createElement('div');
        card.className = 'child-card';
        
        let vRows = '';
        // التحقق إذا كان الطفل لديه أي حجز نشط حالياً
        const hasActiveBooking = child.bookingStatus !== "لا يوجد حجز نشط";

        child.vaccinations.forEach(v => {
            // التعديل هنا: الزر سيظهر لكل التطعيمات القادمة طالما يوجد حجز نشط
            const isPending = v.status === "قادم";
            const actionBtn = (isPending && hasActiveBooking) ? 
                `<br><button onclick="markAsDone(${child.id}, '${v.name}')" class="btn-small" style="background:#10b981; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; margin-top:5px; font-size:0.75rem;">
                    تأكيد الأخذ ✅
                </button>` : '';

            vRows += `<tr>
                <td>${v.name}</td>
                <td>${v.date}</td>
                <td>
                    <span class="${v.status === 'تم أخذها' ? 'status-done' : 'status-upcoming'}">${v.status}</span>
                    ${actionBtn}
                </td>
            </tr>`;
        });

        const bookingInfo = child.bookingEntryDate ? 
            `<div style="background:#fff7ed; padding:12px; border-radius:10px; margin:10px 0; border:1px solid #fed7aa; border-right:5px solid #f97316;">
                <p style="margin:0; font-weight:bold; color:#c2410c;">📍 المكان: ${child.bookingLocation}</p>
                <p style="margin:0; font-size:0.9rem; color:#7c2d12;">📅 موعد الحجز: ${child.bookingEntryDate}</p>
                <p style="margin:5px 0 0 0; font-size:0.8rem; color:#9a3412; font-style:italic;">(ملاحظة: بعد التطعيم، اضغطي على زر "تأكيد الأخذ" في الجدول أدناه لتحديث الكتيب)</p>
            </div>` : '';

        card.innerHTML = `
            <div class="print-header-official" style="display:none;">
                <h2 style="text-align:center;">دولة ليبيا - وزارة الصحة</h2>
                <h3 style="text-align:center;">كتيب التطعيمات الإلكتروني</h3><hr>
            </div>
            <h3 style="color:var(--primary);"><i class="fa-solid fa-baby"></i> الطفل: ${child.name}</h3>
            <p><b>تاريخ الميلاد:</b> ${child.birthDate}</p>
            <p><b>حالة الحجز:</b> <span style="color:#f97316; font-weight:bold;">${child.bookingStatus}</span></p>
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
// 4. نظام الحجز (مع تعديل خصم العدد)
// ==========================================
function confirmBooking() {
    const childId = document.getElementById('childSelect')?.value;
    const centerName = document.getElementById('centerSelect')?.value;
    const selectedVac = document.querySelector('input[name="selectedVaccine"]:checked')?.value;

    if (!childId || !centerName || !selectedVac) { alert("أكملي خيارات الحجز!"); return; }

    // تعديل 2: خصم الكمية من المركز
    let currentCenters = JSON.parse(localStorage.getItem('centersData'));
    const vacIndex = currentCenters[centerName].findIndex(v => v.name === selectedVac);
    
    if (currentCenters[centerName][vacIndex].count <= 0) {
        alert("عذراً، نفدت كمية هذا التطعيم في هذا المركز.");
        return;
    }

    let children = JSON.parse(localStorage.getItem('children')) || [];
    const idx = children.findIndex(c => c.id == childId);

    if (idx !== -1) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const bookingDate = new Date().toLocaleDateString('ar-LY');

        const templateParams = {
            child_name: children[idx].name,
            parent_email: currentUser.email,
            phone_number: currentUser.phone,
            center_name: centerName,
            vaccine: selectedVac
        };

        emailjs.send("service_b8wk5cq", "template_qrm8pcn", templateParams)
            .then(() => {
                // تنفيذ الخصم فعلياً
                currentCenters[centerName][vacIndex].count -= 1;
                localStorage.setItem('centersData', JSON.stringify(currentCenters));

                // تحديث بيانات الطفل
                children[idx].bookingStatus = `محجوز لـ (${selectedVac})`;
                children[idx].bookingLocation = centerName;
                children[idx].bookingEntryDate = bookingDate;
                localStorage.setItem('children', JSON.stringify(children));
                
                alert("تم الحجز بنجاح ونقصت الكمية من المركز! ✅");
                window.location.href = 'dashboard.html';
            })
            .catch(() => {
                // حتى لو فشل الإيميل، نحفظ الحجز محلياً للتسهيل
                currentCenters[centerName][vacIndex].count -= 1;
                localStorage.setItem('centersData', JSON.stringify(currentCenters));
                children[idx].bookingStatus = `محجوز لـ (${selectedVac})`;
                children[idx].bookingLocation = centerName;
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
        if(user) {
            const kids = (JSON.parse(localStorage.getItem('children')) || []).filter(c => c.parentEmail === user.email);
            childSelect.innerHTML = '<option value="" disabled selected>-- اختاري الطفل --</option>';
            kids.forEach(k => childSelect.innerHTML += `<option value="${k.id}">${k.name}</option>`);
        }
    }

    if(centerSelect) {
        centerSelect.innerHTML = '<option value="" disabled selected>-- اختاري المركز --</option>';
        Object.keys(centersData).forEach(c => centerSelect.innerHTML += `<option value="${c}">${c}</option>`);
        
        centerSelect.addEventListener('change', function() {
            const vaccines = centersData[this.value];
            const bookingOptions = document.getElementById('bookingOptions');
            if (vaccines && bookingOptions) {
                let html = `<p style="margin:10px 0; font-weight:bold; color:var(--primary);">التطعيمات المتاحة حالياً:</p>
                <div class="table-wrapper"><table><thead><tr><th>اختيار</th><th>التطعيم</th><th>المخزون</th><th>التاريخ</th></tr></thead><tbody>`;
                vaccines.forEach((v, i) => {
                    html += `<tr>
                        <td><input type="radio" name="selectedVaccine" value="${v.name}" id="v${i}" ${v.count <= 0 ? 'disabled' : ''}></td>
                        <td>${v.name}</td>
                        <td style="color:${v.count < 10 ? 'red' : 'green'}; font-weight:bold;">${v.count}</td>
                        <td>${v.date}</td>
                    </tr>`;
                });
                html += `</tbody></table></div><button onclick="confirmBooking()" class="btn" style="width:100%; margin-top:15px;">تأكيد الحجز ✅</button>`;
                bookingOptions.innerHTML = html;
            }
        });
    }
});

function deleteChild(id) {
    if (confirm("هل أنتِ متأكدة من حذف سجل هذا الطفل؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        localStorage.setItem('children', JSON.stringify(children.filter(c => c.id !== id)));
        location.reload();
    }
}
