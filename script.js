// 1. قاعدة البيانات (التطعيمات + المراكز + المواعيد)
const vaccData = [
    { 
        v: "شلل الأطفال + الخماسي (OPV/DTP)", 
        c: ["مركز الصابري (الأحد 10 مارس - 09:00 ص)", "عيادة الكيش (الأحد 10 مارس - 11:00 ص)"] 
    },
    { 
        v: "الحصبة المنفردة (Measles)", 
        c: ["مركز بنغازي الجديدة (الإثنين 11 مارس - 08:30 ص)", "مركز الصابري (الثلاثاء 12 مارس - 10:00 ص)"] 
    },
    { 
        v: "الثلاثي الفيروسي (MMR)", 
        c: ["عيادة الكيش (الأربعاء 13 مارس - 09:00 ص)", "المركز الصحي الماجوري (الخميس 14 مارس - 11:30 ص)"] 
    }
];

// --- وظائف الهوية (العين والتحقق) ---

// 2. إصلاح زر العين (إظهار/إخفاء كلمة المرور)
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    }
}

// 3. ذكاء زر "احجز الآن" (الفحص قبل الانتقال)
function checkLoginAndRedirect() {
    const isLoggedIn = localStorage.getItem('isLogged');
    if (isLoggedIn === 'true') {
        window.location.href = 'booking.html';
    } else {
        alert("عذراً مودة، يجب عليكِ تسجيل الدخول أولاً للوصول لصفحة الحجز.");
        window.location.href = 'login.html';
    }
}

// 4. تسجيل الخروج
function logout() {
    localStorage.removeItem('isLogged');
    window.location.href = 'index.html';
}

// --- وظائف صفحة الحجز (الفلترة والحفظ) ---

// 5. تعبئة قائمة التطعيمات
function loadVaccines() {
    const vSelect = document.getElementById('vaccineSelect');
    if (vSelect) {
        vSelect.innerHTML = '<option value="">-- اختر التطعيمة --</option>';
        vaccData.forEach(item => {
            let opt = document.createElement('option');
            opt.value = item.v;
            opt.innerText = item.v;
            vSelect.appendChild(opt);
        });
    }
}

// 6. فلترة المراكز والمواعيد
function filterCenters() {
    const vSelect = document.getElementById('vaccineSelect');
    const cSelect = document.getElementById('centerSelect');
    if (!vSelect || !cSelect) return;

    const selected = vSelect.value;
    cSelect.innerHTML = '<option value="">-- اختر المركز والموعد المناسب --</option>';
    cSelect.disabled = true;

    const found = vaccData.find(item => item.v === selected);
    if (found) {
        found.c.forEach(center => {
            let opt = document.createElement('option');
            opt.value = center;
            opt.innerText = center;
            cSelect.appendChild(opt);
        });
        cSelect.disabled = false;
    }
}

// 7. حفظ الحجز الجديد وعرضه في الكتيب
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newBooking = {
            mother: document.getElementById('motherName').value,
            child: document.getElementById('childName').value,
            vaccine: document.getElementById('vaccineSelect').value
        };
        
        let bookings = JSON.parse(localStorage.getItem('sysBookings')) || [];
        bookings.push(newBooking);
        localStorage.setItem('sysBookings', JSON.stringify(bookings));
        
        alert("تم تأكيد الحجز وحفظه في الكتيب الإلكتروني بنجاح!");
        renderArchive(); // تحديث الجدول فوراً
        bookingForm.reset();
    });
}

// 8. عرض الكتيب الإلكتروني (الأرشيف)
function renderArchive() {
    const table = document.getElementById('archiveTable');
    if (table) {
        let bookings = JSON.parse(localStorage.getItem('sysBookings')) || [];
        table.innerHTML = bookings.map(b => `
            <tr>
                <td>${b.mother}</td>
                <td>${b.child}</td>
                <td>${b.vaccine}</td>
                <td><span class="status-badge">قيد الانتظار</span></td>
            </tr>
        `).reverse().join(''); // reverse لجعل أحدث حجز في الأعلى
    }
}

// 9. تفعيل حالة الدخول (للتجربة في صفحة login.html)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('isLogged', 'true');
        window.location.href = 'booking.html';
    });
}

// تشغيل الدوال الأساسية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadVaccines();
    renderArchive();

});
// كود تحديث المواعيد بناءً على المركز المختارة
const centerSelect = document.getElementById('centerSelect');

if (centerSelect) {
    centerSelect.addEventListener('change', function() {
        const selectedCenter = this.value;
        
        // هنا نخبر النظام أن يحدث الجدول بناءً على المركز
        console.log("تم اختيار مركز: " + selectedCenter);
        
        // إذا كان عندك دالة اسمها renderAppointments أو ما يشابهها، سنستدعيها هنا
        if (typeof renderAppointments === "function") {
            renderAppointments(); 
        }
        
        alert("عرض المواعيد المتوفرة في: " + selectedCenter);
    });
}
