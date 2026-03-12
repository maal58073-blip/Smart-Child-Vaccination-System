// 1. قاعدة بيانات المراكز والتطعيمات (محدثة ببيانات خاصة لكل مركز)
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

// 2. تحديث جدول المواعيد ديناميكياً حسب المركز المختار
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

// 3. تأكيد الحجز وإرسال التنبيه عبر الإيميل
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
        // تحديث بيانات الطفل محلياً
        children[childIndex].bookingStatus = `محجوز لـ (${selectedVac}) في: ${center}`;
        localStorage.setItem('children', JSON.stringify(children));
        displayChildren();

        // إعداد بيانات الإيميل
        const childName = childSelect.options[childSelect.selectedIndex].text;
        const templateParams = {
            child_name: childName,
            center_name: center,
            vaccine: selectedVac,
            to_email: 'maal58073@gmail.com' // إيميلك الذي ستصل عليه التنبيهات
        };

        // مفاتيح EmailJS (الرجاء تغيير YOUR_SERVICE_ID بالرقم الخاص بك)
        const serviceID = "service_b8wk5cq"; 
        const templateID = "template_qrm8pcn";

        // إرسال الإيميل
        emailjs.send(serviceID, templateID, templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                alert("تم ربط الحجز بنجاح! ✅ وتم إرسال تنبيه إلى بريدك الإلكتروني 📧");
            }, function(error) {
                console.log('FAILED...', error);
                alert("تم الحجز بنجاح، ولكن حدث خطأ في إرسال الإيميل. (تأكدي من الأكواد)");
            });
    }
}

// 4. حفظ طفل جديد مع قيد التاريخ 
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
        alert("خطأ: لا يمكن إدخال تاريخ في المستقبل! الطفل لم يولد بعد أو التاريخ غير صحيح.");
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
}

// 5. وظيفة تحديث حالة التطعيم يدوياً 
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
            alert("تم تحديث الكتيب! الحالة الآن: تم أخذ التطعيمة ✅");
        }
    }
}

// 6. عرض الكتيبات مع الترويسة الرسمية 
function displayChildren() {
    const container = document.getElementById('childrenCardsContainer');
    if (!container) return;
    const children = JSON.parse(localStorage.getItem('children')) || [];
    container.innerHTML = '';

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const todayStr = new Date().toLocaleDateString('ar-LY', options);

    children.forEach(child => {
        const card = document.createElement('div');
        card.className = 'child-card';
        
        let rows = '';
        child.vaccinations.forEach(v => {
            const isDone = v.status === "تم أخذها";
            const cls = isDone ? "status-done" : "status-upcoming";
            
            rows += `<tr>
                <td>${v.name}</td>
                <td>${v.date}</td>
                <td><span class="${cls}">${v.status}</span></td>
                <td class="no-print">
                    ${!isDone ? `<button onclick="markAsDone(${child.id}, '${v.name}')" class="btn-small btn-success" style="font-size:0.7rem;">تحديث</button>` : '✅'}
                </td>
            </tr>`;
        });

        card.innerHTML = `
            <div class="print-header-official">
                <h2>دولة ليبيا</h2>
                <h3>وزارة الصحة - إدارة التطعيمات</h3>
                <p>تاريخ الطباعة: ${todayStr}</p>
                <hr>
            </div>

            <div style="text-align:center; padding:10px; margin-bottom:10px;">
                <h3 style="margin:0; color:#4f46e5; font-size:1.5rem;">الاسم: ${child.name}</h3>
                <p style="font-size:1rem; color:#666; margin:5px 0;">تاريخ الميلاد: <b>${child.birthDate}</b></p>
                <p style="color:green; font-weight:bold; font-size:0.9rem;">📍 ${child.bookingStatus}</p>
            </div>

            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>التطعيم</th>
                            <th>التاريخ</th>
                            <th>الحالة</th>
                            <th class="no-print">إجراء</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>

            <div class="no-print" style="display:flex; gap:10px; margin-top:15px;">
                <button onclick="window.print()" class="btn-small btn-success" style="flex:2;">حفظ كـ PDF / طباعة 🖨️</button>
                <button onclick="deleteChild(${child.id})" class="btn-small btn-danger" style="flex:1;">حذف</button>
            </div>`;
            
        container.appendChild(card);
    });
}

// 7. حذف طفل
function deleteChild(id) {
    if (confirm("هل أنتِ متأكدة من حذف سجل هذا الطفل نهائياً؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        children = children.filter(c => c.id !== id);
        localStorage.setItem('children', JSON.stringify(children));
        displayChildren();
    }
}

// 8. حماية المشرف بكلمة مرور
function adminLogin() {
    const pass = prompt("أدخلي كلمة مرور المشرف للوصول للوحة التحكم:");
    if (pass === "admin2026") {
        alert("تم تسجيل الدخول بنجاح!");
    } else {
        alert("عذراً، كلمة المرور خاطئة!");
    }
}

// 9. تشغيل وإدارة القوائم عند التحميل
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
