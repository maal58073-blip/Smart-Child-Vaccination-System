// دالة حفظ طفل جديد من الحقول المباشرة
function saveNewChild() {
    const nameInput = document.getElementById('newChildName');
    const dateInput = document.getElementById('birthDate');
    
    const name = nameInput.value.trim();
    const birthDate = dateInput.value;

    // 1. التأكد من إدخال البيانات
    if (!name || !birthDate) {
        alert("الرجاء إدخال الاسم الثلاثي وتاريخ الميلاد!");
        return;
    }

    // 2. منع مواليد 2027 وما بعدها (تحقق إضافي بالكود)
    const selectedDate = new Date(birthDate);
    const currentYear = new Date().getFullYear();
    if (selectedDate.getFullYear() > currentYear) {
        alert("خطأ: لا يمكن تسجيل تاريخ ميلاد في المستقبل!");
        return;
    }

    // 3. تجهيز بيانات الطفل الجديد
    const newChild = {
        id: Date.now(), // رقم تعريفي فريد
        name: name,
        birthDate: birthDate,
        vaccinations: [
            { name: "تطعيم عند الولادة", status: "تم أخذها", date: birthDate },
            { name: "تطعيم الشهرين", status: "قادم", date: "سيحدد لاحقاً" },
            { name: "تطعيم 4 أشهر", status: "قادم", date: "سيحدد لاحقاً" }
            // يمكنك إضافة باقي الجدول هنا
        ]
    };

    // 4. الحفظ في LocalStorage
    let children = JSON.parse(localStorage.getItem('children')) || [];
    children.push(newChild);
    localStorage.setItem('children', JSON.stringify(children));

    // 5. مسح الحقول وإخفاء الفورم
    nameInput.value = '';
    dateInput.value = '';
    toggleChildForm(); // إخفاء الفورم بعد الحفظ

    // 6. تحديث العرض فوراً
    displayChildren();
    
    alert("تم حفظ بيانات الطفل بنجاح!");
}

// دالة عرض الأطفال في الصفحة
function displayChildren() {
    const container = document.getElementById('childrenCardsContainer');
    if (!container) return;

    const children = JSON.parse(localStorage.getItem('children')) || [];
    container.innerHTML = ''; // مسح المحتوى القديم

    if (children.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#64748b;">لا يوجد أطفال مسجلين حالياً.</p>';
        return;
    }

    children.forEach(child => {
        const card = document.createElement('div');
        card.className = 'child-card';
        
        let tableRows = '';
        child.vaccinations.forEach(v => {
            const statusClass = v.status === "تم أخذها" ? "status-done" : "status-upcoming";
            tableRows += `
                <tr>
                    <td>${v.name}</td>
                    <td>${v.date}</td>
                    <td><span class="${statusClass}">${v.status}</span></td>
                </tr>
            `;
        });

        card.innerHTML = `
            <div class="child-info">
                <h3><i class="fa-solid fa-child"></i> ${child.name}</h3>
                <p>تاريخ الميلاد: ${child.birthDate}</p>
                <button onclick="deleteChild(${child.id})" class="btn-small btn-danger no-print">حذف</button>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>التطعيم</th>
                            <th>التاريخ</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            <button onclick="window.print()" class="btn btn-small no-print" style="margin-top:10px; background:#64748b;">
                <i class="fa-solid fa-print"></i> طباعة الكتيب
            </button>
        `;
        container.appendChild(card);
    });
}

// دالة الحذف
function deleteChild(id) {
    if (confirm("هل أنتِ متأكدة من حذف بيانات هذا الطفل؟")) {
        let children = JSON.parse(localStorage.getItem('children')) || [];
        children = children.filter(c => c.id !== id);
        localStorage.setItem('children', JSON.stringify(children));
        displayChildren();
    }
}

// استدعاء العرض عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', displayChildren);
