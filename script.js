// --- 1. التأكد من تحميل الصفحة ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("النظام جاهز...");
    displayChildren(); // عرض الأطفال المخزنين عند البدء
});

// --- 2. دالة إظهار وإخفاء الفورم ---
function toggleChildForm() {
    const form = document.getElementById('addChildForm');
    const btn = document.getElementById('showFormBtn');
    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        btn.innerHTML = '<i class="fa-solid fa-times-circle"></i> إلغاء';
        btn.style.backgroundColor = '#ef4444';
    } else {
        form.style.display = 'none';
        btn.innerHTML = '<i class="fa-solid fa-plus-circle"></i> إضافة طفل جديد (اسم ثلاثي)';
        btn.style.backgroundColor = '#10b981';
    }
}

// --- 3. دالة الحفظ الرئيسية ---
function saveNewChild() {
    const nameInput = document.getElementById('newChildName');
    const dateInput = document.getElementById('birthDate');
    
    if (!nameInput || !dateInput) {
        alert("خطأ: لم يتم العثور على حقول الإدخال في الصفحة!");
        return;
    }

    const name = nameInput.value.trim();
    const birthDate = dateInput.value;

    if (!name || !birthDate) {
        alert("الرجاء إدخال الاسم الثلاثي وتاريخ الميلاد!");
        return;
    }

    // منع تاريخ 2027
    const year = new Date(birthDate).getFullYear();
    if (year > 2026) {
        alert("خطأ: لا يمكن تسجيل مواليد سنة " + year);
        return;
    }

    // إنشاء الكائن للطفل مع جدول التطعيمات
    const newChild = {
        id: Date.now(),
        name: name,
        birthDate: birthDate,
        vaccinations: [
            { name: "عند الولادة (درن/كبد ب)", status: "تم أخذها", date: birthDate },
            { name: "تطعيم شهرين", status: "قادم", date: "معلق" },
            { name: "تطعيم 4 أشهر", status: "قادم", date: "معلق" },
            { name: "تطعيم 6 أشهر", status: "قادم", date: "معلق" },
            { name: "تطعيم 9 أشهر", status: "قادم", date: "معلق" },
            { name: "تطعيم سنة", status: "قادم", date: "معلق" },
            { name: "تطعيم سنة ونصف", status: "قادم", date: "معلق" }
        ]
    };

    // حفظ في الذاكرة المحلية
    let children = JSON.parse(localStorage.getItem('children')) || [];
    children.push(newChild);
    localStorage.setItem('children', JSON.stringify(children));

    // تنظيف الواجهة
    nameInput.value = '';
    dateInput.value = '';
    toggleChildForm();
    
    // إعادة العرض
    displayChildren();
    alert("تمت إضافة " + name + " بنجاح!");
}

// --- 4. دالة عرض الكروت والجداول ---
function displayChildren() {
    const container = document.getElementById('childrenCardsContainer');
    if (!container) return;

    const children = JSON.parse(localStorage.getItem('children')) || [];
    container.innerHTML = '';

    if (children.length === 0) {
        container.innerHTML = '<div class="card"><p>لا يوجد أطفال مسجلين. ابدئي بإضافة طفلك الأول!</p></div>';
        return;
    }

    children.forEach(child => {
        const card = document.createElement('div');
        card.className = 'child-card';
        
        let rows = '';
        child.vaccinations.forEach(v => {
            const cls = v.status === "تم أخذها" ? "status-done" : "status-upcoming";
            rows += `<tr><td>${v.name}</td><td>${v.date}</td><td><span class="${cls}">${v.status}</span></td></tr>`;
        });

        card.innerHTML = `
            <div class="child-info">
                <h3><i class="fa-solid fa-child"></i> ${child.name}</h3>
                <p>تاريخ الميلاد: <strong>${child.birthDate}</strong></p>
                <button onclick="deleteChild(${child.id})" class="btn-small btn-danger no-print">حذف</button>
            </div>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>التطعيم</th><th>التاريخ</th><th>الحالة</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <button onclick="window.print()" class="btn btn-small no-print" style="background:#64748b; margin-top:15px;">
                <i class="fa-solid fa-print"></i> طباعة الكتيب
            </button>
        `;
        container.appendChild(card);
    });
}

// --- 5. دالة الحذف ---
function deleteChild(id) {
    if (confirm("هل أنتِ متأكدة من حذف هذا الطفل نهائياً؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        children = children.filter(c => c.id !== id);
        localStorage.setItem('children', JSON.stringify(children));
        displayChildren();
    }
}
// --- كود خاص بصفحة الحجز booking.html ---

// 1. دالة لتعبئة قائمة الأطفال المسجلين في قائمة الاختيار
function populateChildSelect() {
    const childSelect = document.getElementById('childSelect');
    if (!childSelect) return; // لضمان عدم حدوث خطأ في الصفحات الأخرى

    const children = JSON.parse(localStorage.getItem('children')) || [];
    
    // مسح الخيارات القديمة (باستثناء الخيار الأول)
    childSelect.innerHTML = '<option value="" disabled selected>-- اختر الطفل --</option>';

    children.forEach(child => {
        const option = document.createElement('option');
        option.value = child.id;
        option.textContent = child.name;
        childSelect.appendChild(option);
    });
}

// 2. دالة التعامل مع إرسال نموذج الحجز
if (document.getElementById('bookingForm')) {
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const childId = document.getElementById('childSelect').value;
        const center = document.getElementById('centerSelect').value;

        if (!childId || !center) {
            alert("الرجاء اختيار الطفل والمركز الصحي!");
            return;
        }

        alert("تم حجز الموعد بنجاح! سيتم إرسال تفاصيل الموعد لهاتفك.");
        // يمكنك هنا إضافة منطق لتحديث حالة التطعيم في الـ LocalStorage إذا أردتِ
    });
}

// تشغيل دالة تعبئة الأسماء عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', populateChildSelect);


