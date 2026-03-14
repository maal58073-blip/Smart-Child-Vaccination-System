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
// 2. نظام تسجيل الدخول والمستخدمين
// ==========================================
function showAuth(type) {
    document.getElementById('loginForm').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = type === 'register' ? 'block' : 'none';
    document.getElementById('tab-login').classList.toggle('active', type === 'login');
    document.getElementById('tab-register').classList.toggle('active', type === 'register');
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
    
    // التحقق من عدم تكرار الإيميل
    if (users.some(u => u.email === email)) {
        alert("هذا البريد الإلكتروني مسجل مسبقاً!");
        return;
    }

    const newUser = { name, email, phone, pass };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // تسجيل الدخول تلقائياً بعد الحساب الجديد
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    alert("تم إنشاء حسابك بنجاح يا " + name + "! يمكنك الآن إضافة أطفالك.");
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
    
    // منع الدخول لصفحات لوحة التحكم والحجز بدون تسجيل
    if (!user && (currentPage.includes('dashboard.html') || currentPage.includes('booking.html'))) {
        alert("الرجاء تسجيل الدخول أولاً!");
        window.location.href = 'index.html';
    }
}

// ==========================================
// 3. إدارة بيانات الأطفال (مخصصة لكل أم)
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
        parentEmail: currentUser.email, // مهم جداً: ربط الطفل بأمه فقط
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
    const allChildren = JSON.parse(localStorage.getItem('children')) || [];
    
    // فلترة الأطفال لعرض أطفال الأم الحالية فقط
    const userChildren = allChildren.filter(child => child.parentEmail === currentUser.email);
    
    container.innerHTML = userChildren.length ? '' : '<p>لا يوجد أطفال مسجلين حالياً، أضيفي طفلك الآن.</p>';
    
    userChildren.forEach(child => {
        const card = document.createElement('div');
        card.className = 'child-card';
        card.innerHTML = `
            <h3>الطفل: ${child.name}</h3>
            <p>تاريخ الميلاد: ${child.birthDate}</p>
            <p style="color: ${child.bookingStatus.includes('محجوز') ? 'green' : 'gray'};">
                حالة الحجز: ${child.bookingStatus}
            </p>
            <button onclick="deleteChild(${child.id})" class="btn-small btn-danger">حذف السجل</button>
        `;
        container.appendChild(card);
    });
}

function deleteChild(id) {
    if (confirm("هل أنت متأكدة من حذف سجل هذا الطفل؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        // الاحتفاظ بكل الأطفال ما عدا المحذوف
        children = children.filter(c => c.id !== id);
        localStorage.setItem('children', JSON.stringify(children));
        location.reload();
    }
}

// ==========================================
// 4. نظام الحجز وإرسال الإيميل
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
        
        // تجهيز بيانات الإيميل
        const templateParams = {
            child_name: children[childIndex].name,
            parent_email: currentUser.email,
            phone_number: currentUser.phone,
            center_name: center,
            vaccine: selectedVac
        };

        // إرسال الإيميل (تأكدي من إضافة مكتبة emailjs في الـ HTML)
        emailjs.send("service_b8wk5cq", "template_qrm8pcn", templateParams)
            .then(() => {
                // تحديث حالة الحجز للطفل
                children[childIndex].bookingStatus = `محجوز لـ (${selectedVac}) في: ${center}`;
                localStorage.setItem('children', JSON.stringify(children));
                alert("تم الحجز بنجاح! ستصلك رسالة تأكيد على إيميلك: " + currentUser.email);
                window.location.href = 'dashboard.html';
            })
            .catch((err) => {
                console.error("خطأ في الإيميل:", err);
                alert("حدث خطأ أثناء إرسال الإيميل، لكن تم الحجز في النظام محلياً.");
                // تحديث الحالة حتى لو فشل الإيميل
                children[childIndex].bookingStatus = `محجوز لـ (${selectedVac}) في: ${center}`;
                localStorage.setItem('children', JSON.stringify(children));
                window.location.href = 'dashboard.html';
            });
    }
}

// ==========================================
// 5. تهيئة القوائم المنسدلة (Dropdowns)
// ==========================================
function populateChildSelect() {
    const select = document.getElementById('childSelect');
    if(!select) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allChildren = JSON.parse(localStorage.getItem('children')) || [];
    
    // الأم تختار من أطفالها فقط
    const userChildren = allChildren.filter(c => c.parentEmail === currentUser.email);
    
    select.innerHTML = '<option value="" disabled selected>-- اختاري الطفل --</option>';
    userChildren.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        select.appendChild(opt);
    });
}

function populateCenterSelect() {
    const select = document.getElementById('centerSelect');
    if(!select) return;

    select.innerHTML = '<option value="" disabled selected>-- اختاري المركز الصحي --</option>';
    // جلب أسماء المراكز من قاعدة البيانات الديناميكية
    Object.keys(centersData).forEach(centerName => {
        const opt = document.createElement('option');
        opt.value = centerName;
        opt.textContent = centerName;
        select.appendChild(opt);
    });
}

// ==========================================
// 6. تشغيل الدوال عند تحميل الصفحة
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    if (document.getElementById('childrenCardsContainer')) {
        displayChildren();
    }
    
    if (document.getElementById('childSelect')) {
        populateChildSelect();
        populateCenterSelect(); // جلب المراكز من centersData
    }
});
