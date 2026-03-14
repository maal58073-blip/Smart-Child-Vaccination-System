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
// 2. ميزة إظهار وإخفاء كلمة المرور (العين)
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

// ==========================================
// 3. نظام تسجيل الدخول والمستخدمين
// ==========================================
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

    if (!name || !email || !pass || !phone) { 
        alert("يرجى ملء كافة البيانات!"); 
        return; 
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(u => u.email === email)) {
        alert("هذا البريد الإلكتروني مسجل مسبقاً!");
        return;
    }

    const newUser = { name, email, phone, pass };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // تسجيل الدخول والانتقال للكتيب
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    alert("تم إنشاء حسابك بنجاح يا " + name + "!");
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
        window.location.href = 'dashboard.html'; // الانتقال التلقائي للكتيب
    } else {
        alert("بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً!");
    }
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    const currentPage = window.location.pathname;
    
    if (!user && (currentPage.includes('dashboard.html') || currentPage.includes('booking.html'))) {
        window.location.href = 'index.html';
    }
}

// ==========================================
// 4. إدارة بيانات الأطفال (مخصصة لكل أم)
// ==========================================
function saveNewChild() {
    const name = document.getElementById('newChildName').value.trim();
    const birthDateValue = document.getElementById('birthDate').value;
    const today = new Date().toISOString().split('T')[0];

    if (!name || !birthDateValue) { alert("أكملي البيانات من فضلك!"); return; }
    if (birthDateValue > today) { alert("خطأ: تاريخ الميلاد لا يمكن أن يكون في المستقبل!"); return; }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const newChild = {
        id: Date.now(),
        name: name,
        parentEmail: currentUser.email,
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

function displayChildren() {
    const container = document.getElementById('childrenCardsContainer');
    if (!container) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(!currentUser) return;

    const allChildren = JSON.parse(localStorage.getItem('children')) || [];
    const userChildren = allChildren.filter(child => child.parentEmail === currentUser.email);
    
    container.innerHTML = userChildren.length ? '' : '<p style="text-align:center; padding:20px;">لا يوجد أطفال مسجلين حالياً، أضيفي طفلك الآن.</p>';
    
    userChildren.forEach(child => {
        const card = document.createElement('div');
        card.className = 'child-card';
        card.innerHTML = `
            <h3><i class="fa-solid fa-baby"></i> الطفل: ${child.name}</h3>
            <p>تاريخ الميلاد: ${child.birthDate}</p>
            <p style="color: ${child.bookingStatus.includes('محجوز') ? '#10b981' : '#64748b'}; font-weight:bold;">
                حالة الحجز: ${child.bookingStatus}
            </p>
            <button onclick="deleteChild(${child.id})" class="btn-small btn-danger" style="margin-top:10px;">حذف السجل</button>
        `;
        container.appendChild(card);
    });
}

function deleteChild(id) {
    if (confirm("هل أنت متأكدة من حذف سجل هذا الطفل؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        children = children.filter(c => c.id !== id);
        localStorage.setItem('children', JSON.stringify(children));
        location.reload();
    }
}

// ==========================================
// 5. نظام الحجز وإرسال الإيميل
// ==========================================
function confirmBooking() {
    const childId = document.getElementById('childSelect')?.value;
    const center = document.getElementById('centerSelect')?.value;
    const selectedVac = document.querySelector('input[name="selectedVaccine"]:checked')?.value;

    if (!childId || !center || !selectedVac) { 
        alert("يرجى اختيار الطفل، المركز، ونوع التطعيمة!"); 
        return; 
    }

    let children = JSON.parse(localStorage.getItem('children')) || [];
    const childIndex = children.findIndex(c => c.id == childId);

    if (childIndex !== -1) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        const templateParams = {
            child_name: children[childIndex].name,
            parent_email: currentUser.email,
            phone_number: currentUser.phone,
            center_name: center,
            vaccine: selectedVac
        };

        emailjs.send("service_b8wk5cq", "template_qrm8pcn", templateParams)
            .then(() => {
                children[childIndex].bookingStatus = `محجوز لـ (${selectedVac}) في: ${center}`;
                localStorage.setItem('children', JSON.stringify(children));
                alert("تم الحجز بنجاح! ستصلك رسالة تأكيد على إيميلك: " + currentUser.email);
                window.location.href = 'dashboard.html';
            })
            .catch((err) => {
                alert("تم الحجز بنجاح في النظام.");
                children[childIndex].bookingStatus = `محجوز لـ (${selectedVac}) في: ${center}`;
                localStorage.setItem('children', JSON.stringify(children));
                window.location.href = 'dashboard.html';
            });
    }
}

// ==========================================
// 6. تهيئة الصفحة وتشغيل الدوال
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    if (document.getElementById('childrenCardsContainer')) displayChildren();
    
    // ملء قوائم الحجز
    const childSelect = document.getElementById('childSelect');
    const centerSelect = document.getElementById('centerSelect');
    
    if(childSelect) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const allChildren = JSON.parse(localStorage.getItem('children')) || [];
        const userChildren = allChildren.filter(c => c.parentEmail === currentUser.email);
        
        childSelect.innerHTML = '<option value="" disabled selected>-- اختاري الطفل --</option>';
        userChildren.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            childSelect.appendChild(opt);
        });
    }

    if(centerSelect) {
        centerSelect.innerHTML = '<option value="" disabled selected>-- اختاري المركز الصحي --</option>';
        Object.keys(centersData).forEach(center => {
            const opt = document.createElement('option');
            opt.value = center;
            opt.textContent = center;
            centerSelect.appendChild(opt);
        });
    }
});

// كود إظهار الجدول فور اختيار المركز في صفحة الحجز
const centerSelect = document.getElementById('centerSelect');
if (centerSelect) {
    centerSelect.addEventListener('change', function() {
        const centerName = this.value;
        const vaccines = centersData[centerName];
        const bookingOptions = document.getElementById('bookingOptions');

        if (vaccines && bookingOptions) {
            let tableHTML = `
                <p style="margin-bottom:10px; font-weight:bold; color:var(--primary);">التطعيمات المتوفرة في ${centerName}:</p>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>اختيار</th>
                                <th>التطعيم</th>
                                <th>العدد المتوفر</th>
                                <th>تاريخ التوفر</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            vaccines.forEach((v, index) => {
                tableHTML += `
                    <tr>
                        <td><input type="radio" name="selectedVaccine" value="${v.name}" id="vac${index}"></td>
                        <td><label for="vac${index}">${v.name}</label></td>
                        <td>${v.count} جُرعة</td>
                        <td style="color:var(--danger); font-weight:bold;">${v.date}</td>
                    </tr>
                `;
            });

            tableHTML += `</tbody></table></div>
            <button onclick="confirmBooking()" class="btn" style="width:100%; margin-top:15px;">تأكيد الحجز المختار ✅</button>`;
            
            bookingOptions.innerHTML = tableHTML;
        }
    });
}
