// ==========================================
// 1. قاعدة بيانات النظام (تطعيمات المراكز)
// ==========================================
const centerData = {
    "الفويهات": [
        { id: 101, vaccine: 'شلل الأطفال', date: '12 مايو 2026', spots: 8 },
        { id: 102, vaccine: 'الحصبة (MMR)', date: '15 مايو 2026', spots: 4 }
    ],
    "الكيش": [
        { id: 201, vaccine: 'الدرن (BCG)', date: '20 مايو 2026', spots: 12 },
        { id: 202, vaccine: 'الثلاثي البكتيري', date: '22 مايو 2026', spots: 6 }
    ],
    "الماجوري": [
        { id: 301, vaccine: 'التهاب الكبد', date: '25 مايو 2026', spots: 15 },
        { id: 302, vaccine: 'شلل الأطفال', date: '28 مايو 2026', spots: 2 }
    ],
    "سيدي حسين": [
        { id: 401, vaccine: 'الحصبة الألمانية', date: '01 يونيو 2026', spots: 10 },
        { id: 402, vaccine: 'المكورات الرئوية', date: '05 يونيو 2026', spots: 5 }
    ]
};

// ==========================================
// 2. وظائف الحماية والدخول
// ==========================================

// إظهار وإخفاء كلمة المرور
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

// حماية صفحة المشرف بكلمة مرور (التعديل الجديد)
function checkAdminLogin() {
    const passInput = document.getElementById('adminPassword');
    if (passInput.value === "admin123") { // يمكنك تغيير كلمة السر هنا
        localStorage.setItem('isAdmin', 'true');
        window.location.href = 'admin.html';
    } else {
        alert("خطأ: كلمة مرور المشرف غير صحيحة!");
    }
}

// التحقق من الدخول قبل الحجز
function checkLoginAndRedirect() {
    const isLoggedIn = localStorage.getItem('isLogged');
    if (isLoggedIn === 'true') {
        window.location.href = 'booking.html';
    } else {
        alert("يجب عليكِ تسجيل الدخول أولاً للوصول لصفحة الحجز.");
        window.location.href = 'login.html';
    }
}

// ==========================================
// 3. وظائف الكتيب الإلكتروني والطباعة
// ==========================================

// ميزة تحميل الكتيب كـ PDF (طلب الأستاذة)
function downloadBooklet() {
    window.print(); // سيفتح نافذة الطباعة/الحفظ كـ PDF للمتصفح
}

// عرض الكتيب (الأرشيف)
function renderArchive() {
    const table = document.getElementById('archiveTable');
    if (table) {
        let bookings = JSON.parse(localStorage.getItem('sysBookings')) || [];
        table.innerHTML = bookings.map(b => `
            <tr>
                <td>${b.child}</td>
                <td>${b.vaccine}</td>
                <td>${b.date}</td>
                <td><span class="status-badge" style="background:#dcfce7; color:#166534;">تم الحجز</span></td>
            </tr>
        `).reverse().join('');
    }
}

// ==========================================
// 4. إدارة المواعيد والحجز
// ==========================================

// تحديث المواعيد حسب المركز (الميزة الاحترافية)
function updateAppointmentsByCenter() {
    const centerSelect = document.getElementById('centerSelect');
    const tbody = document.getElementById('appointmentsList');
    if (!centerSelect || !tbody) return;

    const selectedCenter = centerSelect.value;
    const appointments = centerData[selectedCenter] || [];
    
    tbody.innerHTML = '';
    appointments.forEach(app => {
        let spotsText = app.spots === 0 ? 'ممتلئ' : app.spots;
        let disabled = app.spots === 0 ? 'disabled' : '';

        tbody.innerHTML += `
            <tr>
                <td><input type="radio" name="appointment" value="${app.id}" data-vaccine="${app.vaccine}" data-date="${app.date}" ${disabled} required></td>
                <td><strong>${app.vaccine}</strong></td>
                <td>${app.date}</td>
                <td><span class="status-badge">${spotsText}</span></td>
            </tr>
        `;
    });
}

// حفظ الحجز وتحديث الذاكرة
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedRadio = document.querySelector('input[name="appointment"]:checked');
        const childSelect = document.getElementById('childSelect');

        const newBooking = {
            child: childSelect.value,
            vaccine: selectedRadio.getAttribute('data-vaccine'),
            date: selectedRadio.getAttribute('data-date'),
            center: document.getElementById('centerSelect').value
        };
        
        let bookings = JSON.parse(localStorage.getItem('sysBookings')) || [];
        bookings.push(newBooking);
        localStorage.setItem('sysBookings', JSON.stringify(bookings));
        
        alert(`🎉 تم الحجز بنجاح للطفل: ${newBooking.child}`);
        window.location.href = 'dashboard.html'; // الانتقال للكتيب لرؤية الحجز
    });
}

// ==========================================
// 5. التشغيل عند التحميل
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderArchive();
    if (document.getElementById('centerSelect')) {
        updateAppointmentsByCenter();
    }
});
// وظيفة العين لإظهار الباسورد
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

// كلمة مرور المشرف
function checkAdminLogin() {
    const pass = document.getElementById('adminPassword').value;
    if (pass === "admin123") {
        localStorage.setItem('isAdmin', 'true');
        window.location.href = 'admin.html';
    } else {
        alert("كلمة المرور خاطئة!");
    }
}

