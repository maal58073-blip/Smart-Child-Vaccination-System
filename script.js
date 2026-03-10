// --- المرحلة الأولى: قاعدة بيانات المراكز والقيود ---

// 1. قاعدة بيانات المراكز (تحديث النقطة الأولى)
const centersData = {
    "مركز بنغازي الطبي": [
        { name: "شلل الأطفال", count: 50, available: true },
        { name: "الخماسي", count: 12, available: true },
        { name: "الكبد البائي", count: 0, available: false }
    ],
    "مركز سيدي يونس الصحي": [
        { name: "الثلاثي", count: 30, available: true },
        { name: "شلل الأطفال", count: 15, available: true },
        { name: "الدرن", count: 2, available: true }
    ],
    "مستشفى الأطفال": [
        { name: "الحصبة", count: 100, available: true },
        { name: "الروتا", count: 40, available: true }
    ]
};

// 2. تحديث قائمة التطعيمات عند اختيار المركز
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'centerSelect') {
        const center = e.target.value;
        const infoArea = document.querySelector('.booking-step'); 
        const vaccines = centersData[center] || [];
        
        let content = `<p style="margin-bottom:10px;"><b>التطعيمات المتوفرة في ${center}:</b></p>`;
        content += `<div style="display: grid; grid-template-columns: 1fr; gap: 8px;">`;
        
        if (vaccines.length > 0) {
            vaccines.forEach(v => {
                const badgeClass = v.count > 0 ? 'status-done' : 'status-upcoming';
                const statusText = v.count > 0 ? `متوفر (${v.count})` : "غير متوفر حالياً";
                content += `
                    <div style="background: white; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
                        <span>📍 ${v.name}</span>
                        <span class="${badgeClass}" style="font-size: 0.75rem;">${statusText}</span>
                    </div>`;
            });
        } else {
            content += `<p style="color:red;">الرجاء اختيار مركز صحيح من القائمة.</p>`;
        }
        
        content += `</div>`;
        infoArea.innerHTML = content;
    }
});

// --- 1. التأكد من تحميل الصفحة ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("النظام جاهز...");
    displayChildren(); 
    populateChildSelect();
});

// --- 2. دالة إظهار وإخفاء الفورم ---
function toggleChildForm() {
    const form = document.getElementById('addChildForm');
    const btn = document.getElementById('showFormBtn');
    if (!form) return;
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

// --- 3. دالة الحفظ مع قيود التاريخ الصارمة (النقطة الثانية) ---
function saveNewChild() {
    const nameInput = document.getElementById('newChildName');
    const dateInput = document.getElementById('birthDate');
    
    if (!nameInput || !dateInput) return;

    const name = nameInput.value.trim();
    const birthDateValue = dateInput.value;

    if (!name || !birthDateValue) {
        alert("الرجاء إدخال الاسم الثلاثي وتاريخ الميلاد!");
        return;
    }

    const birthDate = new Date(birthDateValue);
    const today = new Date();
    
    // قيد منع التواريخ المستقبلية (مواليد 2027 وما بعدها)
    if (birthDate > today) {
        alert("خطأ طبي: لا يمكن تسجيل طفل لم يولد بعد (تاريخ مستقبلي)!");
        return;
    }

    // قيد العمر المنطقي (مثلاً لا نقبل أطفال أكبر من 15 سنة في منظومة تطعيم صغار)
    const ageInYears = today.getFullYear() - birthDate.getFullYear();
    if (ageInYears > 15) {
        alert("تنبيه: هذا الطفل تجاوز سن التطعيمات الأساسية (أكبر من 15 سنة)!");
        return;
    }

    const newChild = {
        id: Date.now(),
        name: name,
        birthDate: birthDateValue,
        vaccinations: [
            { name: "عند الولادة (درن/كبد ب)", status: "تم أخذها", date: birthDateValue },
            { name: "تطعيم شهرين", status: "قادم", date: "معلق" },
            { name: "تطعيم 4 أشهر", status: "قادم", date: "معلق" },
            { name: "تطعيم 6 أشهر", status: "قادم", date: "معلق" },
            { name: "تطعيم 9 أشهر", status: "قادم", date: "معلق" },
            { name: "تطعيم سنة", status: "قادم", date: "معلق" },
            { name: "تطعيم سنة ونصف", status: "قادم", date: "معلق" }
        ]
    };

    let children = JSON.parse(localStorage.getItem('children')) || [];
    children.push(newChild);
    localStorage.setItem('children', JSON.stringify(children));

    nameInput.value = '';
    dateInput.value = '';
    toggleChildForm();
    displayChildren();
    alert("تم تسجيل الطفل " + name + " بنجاح في المنظومة.");
}

// --- 4. دالة عرض الكروت والجداول ---
function displayChildren() {
    const container = document.getElementById('childrenCardsContainer');
    if (!container) return;

    const children = JSON.parse(localStorage.getItem('children')) || [];
    container.innerHTML = '';

    if (children.length === 0) {
        container.innerHTML = '<div class="card"><p>لا يوجد أطفال مسجلين حالياً.</p></div>';
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
                <i class="fa-solid fa-print"></i> طباعة الكتيب الإلكتروني
            </button>
        `;
        container.appendChild(card);
    });
}

// --- 5. دالة الحذف ---
function deleteChild(id) {
    if (confirm("هل أنتِ متأكدة من حذف سجل هذا الطفل؟ لا يمكن التراجع عن هذه الخطوة.")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        children = children.filter(c => c.id !== id);
        localStorage.setItem('children', JSON.stringify(children));
        displayChildren();
    }
}

// --- دالة تعبئة قائمة الأطفال في صفحة الحجز ---
function populateChildSelect() {
    const childSelect = document.getElementById('childSelect');
    if (!childSelect) return;

    const children = JSON.parse(localStorage.getItem('children')) || [];
    childSelect.innerHTML = '<option value="" disabled selected>-- اختر الطفل --</option>';

    children.forEach(child => {
        const option = document.createElement('option');
        option.value = child.id;
        option.textContent = child.name;
        childSelect.appendChild(option);
    });
}

// نموذج الحجز
if (document.getElementById('bookingForm')) {
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert("تم استلام طلب الحجز! سيتم التحقق من توفر الطعوم في المركز المختار.");
    });
}
