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

// 1. تحديث جدول المواعيد في صفحة الحجز
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'centerSelect') {
        const center = e.target.value;
        const infoArea = document.querySelector('.booking-step'); 
        if (!infoArea) return;

        const vaccines = centersData[center] || [];
        let tableHTML = `<p><b>المواعيد المتاحة في ${center}:</b></p>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr style="background: #f1f5f9;">
                            <th>التطعيم</th>
                            <th>الكمية</th>
                            <th>التاريخ</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        vaccines.forEach(v => {
            tableHTML += `<tr>
                <td>${v.name}</td>
                <td>${v.count}</td>
                <td style="color:blue; font-weight:bold;">${v.date}</td>
            </tr>`;
        });
        tableHTML += `</tbody></table></div>
        <button onclick="confirmBooking()" class="btn" style="margin-top:15px; width:100%;">تأكيد الحجز لهذا المركز ✅</button>`;
        infoArea.innerHTML = tableHTML;
    }
});

// 2. تأكيد الحجز وربط الطفل
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
        children[childIndex].bookingStatus = `محجوز في: ${center}`;
        localStorage.setItem('children', JSON.stringify(children));
        alert("تم ربط الحجز بنجاح!");
        window.location.href = "dashboard.html";
    }
}

// 3. حفظ طفل جديد
function saveNewChild() {
    const nameInput = document.getElementById('newChildName');
    const dateInput = document.getElementById('birthDate');
    const name = nameInput.value.trim();
    const today = new Date().toISOString().split('T')[0]; // تاريخ اليوم

if (!name || !birthDateValue) {
    alert("يرجى إدخال البيانات كاملة!");
    return;
}

if (birthDateValue > today) {
    alert("خطأ: لا يمكن إدخال تاريخ في المستقبل! يرجى إدخال تاريخ ميلاد صحيح.");
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
    toggleChildForm();
    displayChildren();
}

// 4. عرض الأطفال في الكتيب
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
            rows += `<tr>
                <td>${v.name}</td>
                <td>${v.date}</td>
                <td><span class="${cls}">${v.status}</span></td>
            </tr>`;
        });

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
                <button onclick="printSpecificChild()" class="btn-small btn-success" style="flex:2;">طباعة الكتيب 🖨️</button>
                <button onclick="deleteChild(${child.id})" class="btn-small btn-danger" style="flex:1;">حذف</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// 5. دالة الطباعة الاحترافية (محدثة لتعمل مع الهيدر الرسمي)
function printSpecificChild() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
    const dayStr = now.toLocaleDateString('ar-LY', { weekday: 'long' });
    
    // تحديث التاريخ واليوم في الهيدر المخفي
    const dateElem = document.getElementById('print-date-today');
    const dayElem = document.getElementById('print-day-today');
    const headerElem = document.getElementById('official-print-header');
    
    if(dateElem) dateElem.innerText = "بتاريخ: " + dateStr;
    if(dayElem) dayElem.innerText = "يوم: " + dayStr;
    if(headerElem) headerElem.style.display = "block"; // إظهاره مؤقتاً للطباعة

    window.print();
    
    if(headerElem) headerElem.style.display = "none"; // إخفاؤه مجدداً بعد الطباعة
}

// 6. لوحة التحكم (Admin)
function adminLogin() {
    const pass = prompt("كلمة مرور المشرف:");
    if (pass === "2026") showAdminPanel();
    else alert("كلمة مرور خاطئة!");
}

function showAdminPanel() {
    const adminHTML = `
        <div id="adminModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; justify-content:center; align-items:center;">
            <div style="background:white; padding:20px; border-radius:10px; width:90%; max-width:400px; text-align:right;">
                <h3>إدارة الكميات</h3>
                <select id="adminCenterSelect" onchange="loadAdminVaccines()" style="width:100%; padding:10px; margin-bottom:10px;">
                    <option value="">اختر المركز لتعديله</option>
                    <option value="مركز بنغازي الطبي">مركز بنغازي الطبي</option>
                    <option value="مركز سيدي يونس الصحي">مركز سيدي يونس الصحي</option>
                    <option value="مستشفى الأطفال">مستشفى الأطفال</option>
                </select>
                <div id="vaccineEditArea"></div>
                <button onclick="saveAdminChanges()" style="background:green; color:white; padding:10px; width:100%; border:none; border-radius:5px; margin-top:10px;">حفظ</button>
                <button onclick="document.getElementById('adminModal').remove()" style="width:100%; margin-top:5px; background:none; border:none;">إغلاق</button>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', adminHTML);
}

function loadAdminVaccines() {
    const center = document.getElementById('adminCenterSelect').value;
    const vaccines = centersData[center] || [];
    let html = '';
    vaccines.forEach((v, index) => {
        html += `<div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span>${v.name}</span>
            <input type="number" value="${v.count}" id="vac_count_${index}" style="width:60px; text-align:center;">
        </div>`;
    });
    document.getElementById('vaccineEditArea').innerHTML = html;
}

function saveAdminChanges() {
    const center = document.getElementById('adminCenterSelect').value;
    const vaccines = centersData[center] || [];
    vaccines.forEach((v, index) => {
        v.count = parseInt(document.getElementById(`vac_count_${index}`).value);
    });
    alert("تم التحديث!");
    document.getElementById('adminModal').remove();
}

// 7. تشغيل التلقائي
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
    if (confirm("حذف سجل الطفل؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        children = children.filter(c => c.id !== id);
        localStorage.setItem('children', JSON.stringify(children));
        displayChildren();
    }
}
