// 1. قاعدة بيانات المراكز والتواريخ (محدثة)
const centersData = {
    "مركز بنغازي الطبي": [
        { name: "شلل الأطفال", count: 50, date: "2026-03-20" },
        { name: "الخماسي", count: 12, date: "2026-03-22" }
    ],
    "مركز سيدي يونس الصحي": [
        { name: "الثلاثي", count: 30, date: "2026-03-25" },
        { name: "كبد ب", count: 5, date: "2026-03-28" }
    ],
    "مستشفى الأطفال": [
        { name: "الحصبة", count: 100, date: "2026-04-05" },
        { name: "الروتا", count: 40, date: "2026-04-10" }
    ]
};

// تحديث جدول التطعيمات في صفحة الحجز (مع إضافة حاوية للتمرير)
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'centerSelect') {
        const center = e.target.value;
        const infoArea = document.querySelector('.booking-step'); 
        if (!infoArea) return;

        const vaccines = centersData[center] || [];
        // حل مشكلة التمرير هنا بإضافة div style="overflow-x:auto"
        let tableHTML = `<p><b>المواعيد المتاحة في ${center}:</b></p>
            <div style="overflow-x:auto; margin-top:10px; border:1px solid #ddd; border-radius:8px;">
                <table style="width:100%; border-collapse: collapse; background: white; min-width:400px;">
                    <thead>
                        <tr style="background: #f1f5f9;">
                            <th style="padding:10px; border-bottom:1px solid #ddd;">التطعيم</th>
                            <th style="padding:10px; border-bottom:1px solid #ddd;">الكمية</th>
                            <th style="padding:10px; border-bottom:1px solid #ddd;">التاريخ</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        vaccines.forEach(v => {
            tableHTML += `<tr>
                <td style="padding:10px; border-bottom:1px solid #ddd;">${v.name}</td>
                <td style="padding:10px; border-bottom:1px solid #ddd;">${v.count}</td>
                <td style="padding:10px; border-bottom:1px solid #ddd; color:blue; font-weight:bold;">${v.date}</td>
            </tr>`;
        });
        tableHTML += `</tbody></table></div>
        <button onclick="confirmBooking()" class="btn" style="margin-top:15px; width:100%;">تأكيد الحجز لهذا المركز ✅</button>`;
        infoArea.innerHTML = tableHTML;
    }
});

// وظيفة ربط الحجز ببيانات الطفل (المطلب الجديد)
function confirmBooking() {
    const childId = document.getElementById('childSelect')?.value;
    const center = document.getElementById('centerSelect')?.value;

    if (!childId || !center) {
        alert("الرجاء اختيار الطفل والمركز أولاً!");
        return;
    }

    let children = JSON.parse(localStorage.getItem('children')) || [];
    const childIndex = children.findIndex(c => c.id == childId);

    if (childIndex !== -1) {
        // تخزين بيانات الحجز داخل سجل الطفل
        children[childIndex].bookingStatus = `محجوز في: ${center}`;
        localStorage.setItem('children', JSON.stringify(children));
        alert("تم ربط الحجز بنجاح! يمكنكِ رؤية المركز في الكتيب الآن.");
        window.location.href = "dashboard.html";
    }
}

// 2. إدارة بيانات الأطفال والكتيب (معدل لحل مشكلة العرض والتمرير)
function updateVaccineStatus(childId, vaccineName) {
    let children = JSON.parse(localStorage.getItem('children')) || [];
    const childIndex = children.findIndex(c => c.id === childId);
    
    if (childIndex !== -1) {
        const vaccine = children[childIndex].vaccinations.find(v => v.name === vaccineName);
        if (vaccine) {
            vaccine.status = (vaccine.status === "قادم") ? "تم أخذها" : "قادم";
            localStorage.setItem('children', JSON.stringify(children));
            displayChildren();
        }
    }
}

function saveNewChild() {
    const nameInput = document.getElementById('newChildName');
    const dateInput = document.getElementById('birthDate');
    const name = nameInput.value.trim();
    const birthDateValue = dateInput.value;

    if (!name || !birthDateValue) {
        alert("يرجى إدخال البيانات كاملة!");
        return;
    }

    if (new Date(birthDateValue) > new Date()) {
        alert("خطأ: لا يمكن إدخال تاريخ في المستقبل (2027)! سجل طفلاً ولد بالفعل.");
        return;
    }

    const newChild = {
        id: Date.now(),
        name: name,
        birthDate: birthDateValue,
        bookingStatus: "لا يوجد حجز نشط", // حالة افتراضية
        vaccinations: [
            { name: "عند الولادة", status: "تم أخذها", date: birthDateValue },
            { name: "شهرين", status: "قادم", date: "معلق" },
            { name: "4 أشهر", status: "قادم", date: "معلق" },
            { name: "6 أشهر", status: "قادم", date: "معلق" }
        ]
    };

    let children = JSON.parse(localStorage.getItem('children')) || [];
    children.push(newChild);
    localStorage.setItem('children', JSON.stringify(children));
    nameInput.value = '';
    dateInput.value = '';
    toggleChildForm();
    displayChildren();
}

function displayChildren() {
    const container = document.getElementById('childrenCardsContainer');
    if (!container) return;
    const children = JSON.parse(localStorage.getItem('children')) || [];
    container.innerHTML = '';

    children.forEach(child => {
        const card = document.createElement('div');
        card.className = 'child-card';
        let rows = '';
        child.vaccinations.forEach(v => {
            const cls = v.status === "تم أخذها" ? "status-done" : "status-upcoming";
            rows += `<tr onclick="updateVaccineStatus(${child.id}, '${v.name}')" style="cursor:pointer">
                <td>${v.name}</td>
                <td>${v.date}</td>
                <td><span class="${cls}">${v.status}</span></td>
            </tr>`;
        });

        // تم تعديل الجزء التالي لحل مشكلة التمرير وإظهار المركز المحجوز فيه
        card.innerHTML = `
            <div style="text-align:center; padding:10px; border-bottom:1px solid #eee;">
                <h3 style="margin:0;">${child.name}</h3>
                <p style="font-size:0.9rem; color:#666;">تاريخ الميلاد: ${child.birthDate}</p>
                <p style="color:green; font-weight:bold; font-size:0.85rem;">📍 ${child.bookingStatus}</p>
            </div>
            
            <div style="overflow-x:auto; width:100%; -webkit-overflow-scrolling: touch;">
                <table style="min-width:450px; width:100%;">
                    <thead><tr><th>التطعيم</th><th>التاريخ</th><th>الحالة</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            
            <div class="no-print" style="display:flex; gap:5px; margin-top:10px;">
                <button onclick="window.print()" style="flex:2; background:#4f46e5; color:white; border:none; padding:8px; border-radius:5px;">طباعة الكتيب</button>
                <button onclick="deleteChild(${child.id})" style="flex:1; background:none; color:red; border:1px solid red; border-radius:5px;">حذف</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// 3. لوحة تحكم المشرف (Admin)
function adminLogin() {
    const pass = prompt("كلمة مرور المشرف:");
    if (pass === "2026") {
        showAdminPanel();
    } else {
        alert("كلمة مرور خاطئة!");
    }
}

function showAdminPanel() {
    const adminHTML = `
        <div id="adminModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; justify-content:center; align-items:center;">
            <div style="background:white; padding:20px; border-radius:10px; width:90%; max-width:400px; text-align:right;">
                <h3 style="margin-top:0;">إدارة الكميات</h3>
                <select id="adminCenterSelect" onchange="loadAdminVaccines()" style="width:100%; padding:10px; margin-bottom:10px;">
                    <option value="">اختر المركز لتعديله</option>
                    <option value="مركز بنغازي الطبي">مركز بنغازي الطبي</option>
                    <option value="مركز سيدي يونس الصحي">مركز سيدي يونس الصحي</option>
                    <option value="مستشفى الأطفال">مستشفى الأطفال</option>
                </select>
                <div id="vaccineEditArea" style="max-height:200px; overflow-y:auto;"></div>
                <button onclick="saveAdminChanges()" style="background:green; color:white; padding:10px; width:100%; border:none; border-radius:5px; margin-top:10px;">حفظ التعديلات</button>
                <button onclick="document.getElementById('adminModal').remove()" style="width:100%; margin-top:5px; background:none; border:none; color:#666;">إغلاق</button>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', adminHTML);
}

function loadAdminVaccines() {
    const center = document.getElementById('adminCenterSelect').value;
    const editArea = document.getElementById('vaccineEditArea');
    const vaccines = centersData[center] || [];
    let html = '';
    vaccines.forEach((v, index) => {
        html += `<div style="display:flex; justify-content:space-between; margin-bottom:8px; padding:5px; background:#f9f9f9;">
            <span>${v.name}</span>
            <input type="number" value="${v.count}" id="vac_count_${index}" style="width:60px; text-align:center;">
        </div>`;
    });
    editArea.innerHTML = html;
}

function saveAdminChanges() {
    const center = document.getElementById('adminCenterSelect').value;
    const vaccines = centersData[center] || [];
    vaccines.forEach((v, index) => {
        v.count = parseInt(document.getElementById(`vac_count_${index}`).value);
    });
    alert("تم تحديث المخزون بنجاح!");
    document.getElementById('adminModal').remove();
}

// تشغيل عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    displayChildren();
    populateChildSelect();
});

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

function toggleChildForm() {
    const form = document.getElementById('addChildForm');
    if(form) form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
}

function deleteChild(id) {
    if (confirm("حذف سجل الطفل؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        children = children.filter(c => c.id !== id);
        localStorage.setItem('children', JSON.stringify(children));
        displayChildren();
    }
}
// دالة الطباعة المطورة مع التاريخ واليوم
function printSpecificChild() {
    // جلب التاريخ واليوم الحالي باللغة العربية
    const now = new Date();
    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
    const optionsDay = { weekday: 'long' };
    
    document.getElementById('print-date-today').innerText = "تاريخ الإصدار: " + now.toLocaleDateString('ar-LY', optionsDate);
    document.getElementById('print-day-today').innerText = "يوم: " + now.toLocaleDateString('ar-LY', optionsDay);

    window.print();
}
