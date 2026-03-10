// ==========================================
// المرحلة الأولى: قاعدة بيانات المراكز والقيود
// ==========================================

const centersData = {
    "مركز بنغازي الطبي": [
        { name: "شلل الأطفال", count: 50 },
        { name: "الخماسي", count: 12 }
    ],
    "مركز سيدي يونس الصحي": [
        { name: "الثلاثي", count: 30 },
        { name: "كبد ب", count: 5 }
    ],
    "مستشفى الأطفال": [
        { name: "الحصبة", count: 100 },
        { name: "الروتا", count: 40 }
    ]
};

// تحديث قائمة التطعيمات عند اختيار المركز (صفحة الحجز)
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'centerSelect') {
        const center = e.target.value;
        const infoArea = document.querySelector('.booking-step'); 
        if (!infoArea) return;

        const vaccines = centersData[center] || [];
        let content = `<p><b>التطعيمات المتوفرة في ${center}:</b></p><ul style="list-style:none; padding:0;">`;
        vaccines.forEach(v => {
            content += `<li style="margin-bottom:5px;">📍 ${v.name} - المتوفر: (${v.count})</li>`;
        });
        content += `</ul>`;
        infoArea.innerHTML = content;
    }
});

// ==========================================
// المرحلة الثانية: تحديث حالة التطعيم داخل الكتيب
// ==========================================

function updateVaccineStatus(childId, vaccineName) {
    let children = JSON.parse(localStorage.getItem('children')) || [];
    const childIndex = children.findIndex(c => c.id === childId);
    
    if (childIndex !== -1) {
        const vaccine = children[childIndex].vaccinations.find(v => v.name === vaccineName);
        if (vaccine) {
            // تبديل الحالة
            vaccine.status = (vaccine.status === "قادم") ? "تم أخذها" : "قادم";
            localStorage.setItem('children', JSON.stringify(children));
            displayChildren(); // إعادة العرض فوراً
        }
    }
}

// ==========================================
// الوظائف الأساسية للمنظومة
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    displayChildren(); 
    populateChildSelect();
});

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

function saveNewChild() {
    const nameInput = document.getElementById('newChildName');
    const dateInput = document.getElementById('birthDate');
    if (!nameInput || !dateInput) return;

    const name = nameInput.value.trim();
    const birthDateValue = dateInput.value;

    if (!name || !birthDateValue) {
        alert("الرجاء إدخال الاسم وتاريخ الميلاد!");
        return;
    }

    // قيد التاريخ (منع 2027 والمستقبل)
    const birthDate = new Date(birthDateValue);
    const today = new Date();
    if (birthDate > today) {
        alert("خطأ: لا يمكن تسجيل تاريخ في المستقبل!");
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
    alert("تمت إضافة الطفل بنجاح.");
}

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
            // جعل السطر قابل للضغط لتحديث الحالة (المرحلة الثانية)
            rows += `
                <tr onclick="updateVaccineStatus(${child.id}, '${v.name}')" style="cursor:pointer">
                    <td>${v.name}</td>
                    <td>${v.date}</td>
                    <td><span class="${cls}">${v.status}</span></td>
                </tr>`;
        });

        card.innerHTML = `
            <div class="child-info">
                <h3><i class="fa-solid fa-child"></i> ${child.name}</h3>
                <p>تاريخ الميلاد: <strong>${child.birthDate}</strong></p>
                <button onclick="deleteChild(${child.id})" class="btn-small btn-danger no-print">حذف</button>
            </div>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>التطعيم</th><th>التاريخ</th><th>الحالة (اضغط للتحديث)</th></tr></thead>
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

function deleteChild(id) {
    if (confirm("هل أنتِ متأكدة؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        children = children.filter(c => c.id !== id);
        localStorage.setItem('children', JSON.stringify(children));
        displayChildren();
    }
}

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
