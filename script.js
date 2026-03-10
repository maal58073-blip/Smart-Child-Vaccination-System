// 1. قاعدة بيانات المراكز والتواريخ
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

// تحديث جدول التطعيمات في صفحة الحجز
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'centerSelect') {
        const center = e.target.value;
        const infoArea = document.querySelector('.booking-step'); 
        if (!infoArea) return;

        const vaccines = centersData[center] || [];
        let tableHTML = `<p><b>المواعيد المتاحة في ${center}:</b></p>
            <table style="width:100%; border-collapse: collapse; background: white; margin-top:10px;">
                <thead>
                    <tr style="background: #f1f5f9;">
                        <th style="padding:10px; border:1px solid #ddd;">التطعيم</th>
                        <th style="padding:10px; border:1px solid #ddd;">الكمية</th>
                        <th style="padding:10px; border:1px solid #ddd;">التاريخ</th>
                    </tr>
                </thead>
                <tbody>`;
        
        vaccines.forEach(v => {
            tableHTML += `<tr>
                <td style="padding:10px; border:1px solid #ddd;">${v.name}</td>
                <td style="padding:10px; border:1px solid #ddd;">${v.count}</td>
                <td style="padding:10px; border:1px solid #ddd; color:blue;">${v.date}</td>
            </tr>`;
        });
        tableHTML += `</tbody></table>`;
        infoArea.innerHTML = tableHTML;
    }
});

// 2. إدارة بيانات الأطفال والكتيب
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

    const birthDate = new Date(birthDateValue);
    const today = new Date();
    if (birthDate > today) {
        alert("خطأ: لا يمكن إدخال تاريخ في المستقبل!");
        return;
    }

    const newChild = {
        id: Date.now(),
        name: name,
        birthDate: birthDateValue,
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

        card.innerHTML = `
            <h3>${child.name}</h3>
            <p>تاريخ الميلاد: ${child.birthDate}</p>
            <table>
                <thead><tr><th>التطعيم</th><th>التاريخ</th><th>الحالة</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
            <button onclick="window.print()" class="no-print">طباعة الكتيب</button>
            <button onclick="deleteChild(${child.id})" class="no-print" style="color:red">حذف</button>
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
            <div style="background:white; padding:20px; border-radius:10px; width:400px; text-align:right;">
                <h3>لوحة التحكم</h3>
                <select id="adminCenterSelect" onchange="loadAdminVaccines()" style="width:100%; padding:10px; margin:10px 0;">
                    <option value="">اختر المركز لتعديله</option>
                    <option value="مركز بنغازي الطبي">مركز بنغازي الطبي</option>
                    <option value="مركز سيدي يونس الصحي">مركز سيدي يونس الصحي</option>
                </select>
                <div id="vaccineEditArea"></div>
                <button onclick="saveAdminChanges()" style="background:green; color:white; padding:10px; width:100%; margin-top:10px;">حفظ</button>
                <button onclick="document.getElementById('adminModal').remove()" style="width:100%; margin-top:5px;">إغلاق</button>
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
        html += `<div style="margin-bottom:5px;">${v.name}: <input type="number" value="${v.count}" id="vac_count_${index}" style="width:60px;"></div>`;
    });
    editArea.innerHTML = html;
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

// تشغيل عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    displayChildren();
    if(typeof populateChildSelect === "function") populateChildSelect();
});

function toggleChildForm() {
    const form = document.getElementById('addChildForm');
    if(form) form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
}

function deleteChild(id) {
    if (confirm("حذف السجل؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        children = children.filter(c => c.id !== id);
        localStorage.setItem('children', JSON.stringify(children));
        displayChildren();
    }
}
