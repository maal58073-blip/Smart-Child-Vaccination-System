// 1. قاعدة بيانات المراكز والتطعيمات
const centersData = {
    "مركز الفويهات الصحي": [
        { name: "شلل الأطفال", count: 120, date: "2026-03-15" },
        { name: "الخماسي", count: 35, date: "2026-03-18" },
        { name: "الروتا", count: 60, date: "2026-03-25" }
    ],
    "مركز بنغازي الطبي": [
        { name: "شلل الأطفال", count: 200, date: "2026-03-20" },
        { name: "الخماسي", count: 12, date: "2026-03-22" },
        { name: "الحصبة", count: 90, date: "2026-04-05" }
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

// 2. تحديث جدول المواعيد
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'centerSelect') {
        const center = e.target.value;
        const infoArea = document.querySelector('.booking-step'); 
        if (!infoArea) return;

        const vaccines = centersData[center] || [];
        let tableHTML = `<p style="margin-top:15px;"><b>المواعيد والكميات المتاحة في ${center}:</b></p>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>اختيار</th>
                            <th>التطعيم</th>
                            <th>المتوفر (جرعة)</th>
                            <th>التاريخ المتاح</th>
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

// 3. تأكيد الحجز وإرسال الإيميل (معدل بالمعرفات الخاصة بكِ)
function confirmBooking() {
    const childSelect = document.getElementById('childSelect');
    const childId = childSelect?.value;
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
        displayChildren();

        // بيانات الإرسال
        const childName = childSelect.options[childSelect.selectedIndex].text;
        const templateParams = {
            child_name: childName,
            center_name: center,
            vaccine: selectedVac,
            to_email: 'maal58073@gmail.com'
        };

        // مفاتيحك الخاصة التي أرسلتِها
        const serviceID = "service_b8wk5cq"; 
        const templateID = "template_qrm8pcn";

        emailjs.send(serviceID, templateID, templateParams)
            .then(function() {
                alert("تم ربط الحجز بنجاح! ✅ وتم إرسال تنبيه إلى بريدك الإلكتروني 📧");
            }, function(error) {
                console.error("EmailJS Error:", error);
                alert("تم الحجز محلياً، ولكن فشل إرسال الإيميل. تأكدي من الاتصال بالإنترنت.");
            });
    }
}

// 4. حفظ طفل جديد
function saveNewChild() {
    const nameInput = document.getElementById('newChildName');
    const dateInput = document.getElementById('birthDate');
    const name = nameInput.value.trim();
    const birthDateValue = dateInput.value;

    if (!name || !birthDateValue) {
        alert("يرجى إدخال البيانات كاملة!");
        return;
    }

    const newChild = {
        id: Date.now(),
        name: name,
        birthDate: birthDateValue,
        bookingStatus: "لا يوجد حجز نشط حالياً",
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
    if (document.getElementById('childSelect')) populateChildSelect();
}

// باقي الوظائف (تحديث، حذف، عرض)
function markAsDone(childId, vaccineName) {
    let children = JSON.parse(localStorage.getItem('children')) || [];
    const childIndex = children.findIndex(c => c.id == childId);
    if (childIndex !== -1) {
        const today = new Date().toLocaleDateString('ar-LY');
        const vacIndex = children[childIndex].vaccinations.findIndex(v => v.name === vaccineName);
        if (vacIndex !== -1) {
            children[childIndex].vaccinations[vacIndex].status = "تم أخذها";
            children[childIndex].vaccinations[vacIndex].date = today;
            localStorage.setItem('children', JSON.stringify(children));
            displayChildren();
        }
    }
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
            const isDone = v.status === "تم أخذها";
            rows += `<tr><td>${v.name}</td><td>${v.date}</td><td><span class="${isDone ? 'status-done' : 'status-upcoming'}">${v.status}</span></td><td class="no-print">${!isDone ? `<button onclick="markAsDone(${child.id}, '${v.name}')" class="btn-small btn-success">تحديث</button>` : '✅'}</td></tr>`;
        });

        card.innerHTML = `<div class="print-header-official"><h2>دولة ليبيا</h2><h3>وزارة الصحة</h3><hr></div><div style="text-align:center;"><h3>الاسم: ${child.name}</h3><p>الميلاد: ${child.birthDate}</p><p style="color:green;">📍 ${child.bookingStatus}</p></div><table><thead><tr><th>التطعيم</th><th>التاريخ</th><th>الحالة</th><th class="no-print">إجراء</th></tr></thead><tbody>${rows}</tbody></table><div class="no-print" style="margin-top:15px;"><button onclick="window.print()" class="btn-small btn-success">طباعة 🖨️</button> <button onclick="deleteChild(${child.id})" class="btn-small btn-danger">حذف</button></div>`;
        container.appendChild(card);
    });
}

function deleteChild(id) {
    if (confirm("حذف سجل الطفل؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        children = children.filter(c => c.id !== id);
        localStorage.setItem('children', JSON.stringify(children));
        displayChildren();
        if (document.getElementById('childSelect')) populateChildSelect();
    }
}

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
