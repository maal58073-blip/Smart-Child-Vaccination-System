// 1. قاعدة بيانات المراكز والتطعيمات
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

// 2. تحديث جدول المواعيد عند اختيار المركز
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'centerSelect') {
        const center = e.target.value;
        const infoArea = document.querySelector('.booking-step'); 
        if (!infoArea) return;

        const vaccines = centersData[center] || [];
        let tableHTML = `<p style="margin-top:15px;"><b>المواعيد المتاحة في ${center}:</b></p>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>اختيار</th>
                            <th>التطعيم</th>
                            <th>الكمية</th>
                            <th>التاريخ</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        vaccines.forEach((v, index) => {
            tableHTML += `<tr>
                <td><input type="radio" name="selectedVaccine" value="${v.name}" id="vac_${index}"></td>
                <td><label for="vac_${index}">${v.name}</label></td>
                <td>${v.count}</td>
                <td style="color:blue; font-weight:bold;">${v.date}</td>
            </tr>`;
        });
        
        tableHTML += `</tbody></table></div>
        <button onclick="confirmBooking()" class="btn" style="margin-top:15px; width:100%;">تأكيد الحجز لهذا المركز ✅</button>`;
        infoArea.innerHTML = tableHTML;
    }
});

// 3. تأكيد الحجز والربط التلقائي
function confirmBooking() {
    const childId = document.getElementById('childSelect')?.value;
    const center = document.getElementById('centerSelect')?.value;
    const selectedVac = document.querySelector('input[name="selectedVaccine"]:checked')?.value;

    if (!childId || !center || !selectedVac) {
        alert("الرجاء اختيار الطفل، المركز، ونوع التطعيمة أولاً!");
        return;
    }

    let children = JSON.parse(localStorage.getItem('children')) || [];
    const childIndex = children.findIndex(c => c.id == childId);

    if (childIndex !== -1) {
        children[childIndex].bookingStatus = `محجوز لـ (${selectedVac}) في: ${center}`;
        localStorage.setItem('children', JSON.stringify(children));
        alert("تم ربط الحجز بنجاح! جاري توجيهك لصفحة الكتيب...");
        window.location.href = "dashboard.html";
    }
}

// 4. حفظ طفل جديد مع قيد التاريخ (منع 2027)
function saveNewChild() {
    const nameInput = document.getElementById('newChildName');
    const dateInput = document.getElementById('birthDate');
    const name = nameInput.value.trim();
    const birthDateValue = dateInput.value;
    const today = new Date().toISOString().split('T')[0];

    if (!name || !birthDateValue) {
        alert("يرجى إدخال البيانات كاملة!");
        return;
    }

    if (birthDateValue > today) {
        alert("خطأ: لا يمكن إدخال تاريخ في المستقبل! (سنة 2027 غير مقبولة حالياً)");
        return;
    }

    const newChild = {
        id: Date.now(),
        name: name,
        birthDate: birthDateValue,
        bookingStatus: "لا يوجد حجز نشط",
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
    if(document.getElementById('addChildForm')) toggleChildForm();
    displayChildren();
    alert("تم حفظ بيانات الطفل بنجاح! 🌸");
}

// 5. عرض الكتيبات
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
            rows += `<tr><td>${v.name}</td><td>${v.date}</td><td><span class="${cls}">${v.status}</span></td></tr>`;
        });
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const today = new Date().toLocaleDateString('ar-LY', options);

card.innerHTML = `
    <div class="print-header-official">
        <h2>دولة ليبيا</h2>
        <h3>وزارة الصحة - إدارة التطعيمات</h3>
        <p>${today}</p>
        <hr>
    </div>

    <div class="child-info-header">
        <h4>${child.name}</h4>
        <p>تاريخ الميلاد: ${child.birthDate}</p>
    </div>
    
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>التطعيم</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    </div>
`;

        card.innerHTML = `
            <div style="text-align:center; padding:10px; border-bottom:1px solid #eee; margin-bottom:10px;">
                <h3 style="margin:0; color:#4f46e5;">${child.name}</h3>
                <p style="font-size:0.9rem; color:#666; margin:5px 0;">تاريخ الميلاد: ${child.birthDate}</p>
                <p style="color:green; font-weight:bold; font-size:0.85rem;">📍 ${child.bookingStatus}</p>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>التطعيم</th><th>التاريخ</th><th>الحالة</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div class="no-print" style="display:flex; gap:10px; margin-top:15px;">
                <button onclick="printSpecificChild()" class="btn-small btn-success" style="flex:2;">حفظ/طباعة الكتيب (PDF) 🖨️</button>
                <button onclick="deleteChild(${child.id})" class="btn-small btn-danger" style="flex:1;">حذف</button>
            </div>`;
        container.appendChild(card);
    });
}

// 6. الطباعة الاحترافية
function printSpecificChild() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
    const dayStr = now.toLocaleDateString('ar-LY', { weekday: 'long' });
    
    const dateElem = document.getElementById('print-date-today');
    const dayElem = document.getElementById('print-day-today');
    const headerElem = document.getElementById('official-print-header');
    
    if(dateElem) dateElem.innerText = "بتاريخ: " + dateStr;
    if(dayElem) dayElem.innerText = "يوم: " + dayStr;
    if(headerElem) headerElem.style.display = "block";

    window.print();
    if(headerElem) headerElem.style.display = "none";
}

// 7. حماية الإدارة (كلمة المرور)
function adminLogin() {
    const pass = prompt("أدخلي كلمة مرور المشرف:");
    if (pass === "admin2026") showAdminPanel();
    else alert("عذراً، كلمة المرور خاطئة!");
}

// 8. تشغيل وإدارة القوائم
document.addEventListener('DOMContentLoaded', () => {
    displayChildren();
    if (document.getElementById('childSelect')) populateChildSelect();
});

function populateChildSelect() {
    const childSelect = document.getElementById('childSelect');
    if(!childSelect) return;
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
    if (confirm("هل أنتِ متأكدة من حذف سجل هذا الطفل؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        children = children.filter(c => c.id !== id);
        localStorage.setItem('children', JSON.stringify(children));
        displayChildren();
    }
}
