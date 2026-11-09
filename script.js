// ======================================
// EMPLOYEE ATTENDANCE MONITORING SYSTEM
// ======================================

// Get HTML elements easily
const $ = id => document.getElementById(id);

// Get today's local date
function getToday() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// ======================================
// DEFAULT COMPANIES
// ======================================

const defaultCompanies = [
    "Boboy Sari-Sari Store",
    "Buy and Sell Full Charge E-Bike",
    "Qualfon",
    "Web Developer",
    "Smart Trading"
];

// 50 sample employee names
const employeeNames = [
    "John Mark Santos", "Maria Cruz", "Kevin Reyes",
    "Angela Garcia", "Joshua Flores", "Nicole Ramos",
    "Daniel Mendoza", "Christine Torres", "Michael Lopez",
    "Samantha Dela Cruz",

    "James Fernandez", "Patricia Gonzales", "Ryan Aquino",
    "Michelle Castillo", "Brian Navarro", "Andrea Villanueva",
    "Christian Bautista", "Jasmine Rivera", "Carlo Morales",
    "Denise Mercado",

    "Mark Anthony Perez", "Janine Salazar", "Joshua Lim",
    "Kathleen Valdez", "Nathaniel Castro", "Rhea Domingo",
    "Francis Padilla", "Trisha Mendoza", "Aaron Santiago",
    "Camille Robles",

    "Gabriel Herrera", "Monica Fuentes", "Patrick Garcia",
    "Leslie Ramos", "Jerome Torres", "Angelica Flores",
    "Vincent Reyes", "Clarisse Aquino", "Edwin Lopez",
    "Kristine Santos",

    "Adrian Navarro", "Beatrice Castillo", "Marco Rivera",
    "Denise Bautista", "Paul Mercado", "Joyce Gonzales",
    "Rafael Villanueva", "Sheila Morales", "Dominic Lim",
    "Faith Fernandez"
];

// ======================================
// DATA STORAGE
// ======================================

// Load saved data from localStorage
function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);

        if (saved === null) return fallback;

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
        console.error("Unable to load saved data:", error);
        return fallback;
    }
}

let companies = loadData("worktrack_companies", null);
let employees = loadData("worktrack_employees", null);
let attendance = loadData("worktrack_attendance", []);

if (!companies) {
    companies = defaultCompanies.map((name, index) => ({
        id: "company-" + (index + 1),
        name: name
    }));
}

if (!employees) {
    employees = employeeNames.map((name, index) => {
        const companyIndex = Math.floor(index / 10);
        const company = companies[companyIndex];

        return {
            id: "employee-" + (index + 1),
            name: name,
            email: name.toLowerCase()
                .replace(/\s+/g, ".") + "@gmail.com",
            phone: "09" + String(170000000 + index),
            position: "Staff",
            companyId: company.id
        };
    });
}

// Save all records
function saveData() {
    localStorage.setItem(
        "worktrack_companies",
        JSON.stringify(companies)
    );

    localStorage.setItem(
        "worktrack_employees",
        JSON.stringify(employees)
    );

    localStorage.setItem(
        "worktrack_attendance",
        JSON.stringify(attendance)
    );
}

// Generate unique IDs
function createId() {
    return "id-" + Date.now() + "-" +
        Math.random().toString(36).slice(2, 8);
}

// Prevent HTML injection in displayed data
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Find company name
function getCompanyName(id) {
    const company = companies.find(c => c.id === id);
    return company ? company.name : "Unknown Company";
}

// Find attendance record
function getAttendance(employeeId, date) {
    return attendance.find(a =>
        a.employeeId === employeeId && a.date === date
    );
}

// ======================================
// PAGE NAVIGATION
// ======================================

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("hidden");
    });

    $(pageId).classList.remove("hidden");

    if (pageId === "dashboard") renderDashboard();
    if (pageId === "companies") renderCompanies();
    if (pageId === "employees") renderEmployees();
    if (pageId === "attendance") renderAttendance();
    if (pageId === "reports") renderReports();
}

// ======================================
// COMPANY MANAGEMENT
// ======================================

// Display companies
function renderCompanies() {
    $("companyTable").innerHTML = companies.map(company => {
        const count = employees.filter(e =>
            e.companyId === company.id
        ).length;

        return `
            <tr>
                <td>${escapeHTML(company.name)}</td>
                <td>${count}</td>
                <td>
                    <button class="edit"
                        onclick="editCompany('${company.id}')">
                        Edit
                    </button>

                    <button class="delete"
                        onclick="deleteCompany('${company.id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("") || `
        <tr><td colspan="3">No companies found.</td></tr>
    `;

    updateCompanyOptions();
}

// Add or update company
$("companyForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = $("companyName").value.trim();
    const id = $("companyId").value;

    if (!name) {
        alert("Please enter a company name.");
        return;
    }

    const duplicate = companies.some(c =>
        c.name.toLowerCase() === name.toLowerCase() &&
        c.id !== id
    );

    if (duplicate) {
        alert("This company already exists.");
        return;
    }

    if (id) {
        const company = companies.find(c => c.id === id);

        if (company) company.name = name;
    } else {
        companies.push({
            id: createId(),
            name: name
        });
    }

    saveData();
    resetCompanyForm();
    refreshAll();

    alert("Company record saved successfully!");
});

// Edit company
function editCompany(id) {
    const company = companies.find(c => c.id === id);

    if (!company) return;

    $("companyId").value = company.id;
    $("companyName").value = company.name;

    $("companySubmit").textContent = "Update Company";
    $("cancelCompanyEdit").classList.remove("hidden");

    $("companyName").focus();
}

// Cancel company editing
function resetCompanyForm() {
    $("companyForm").reset();
    $("companyId").value = "";
    $("companySubmit").textContent = "Add Company";
    $("cancelCompanyEdit").classList.add("hidden");
}

$("cancelCompanyEdit").addEventListener("click", resetCompanyForm);

// Delete company
function deleteCompany(id) {
    const company = companies.find(c => c.id === id);

    if (!company) return;

    if (!confirm(
        `Delete ${company.name} and all its employee and attendance records?`
    )) return;

    const employeeIds = employees
        .filter(e => e.companyId === id)
        .map(e => e.id);

    companies = companies.filter(c => c.id !== id);

    employees = employees.filter(e => e.companyId !== id);

    attendance = attendance.filter(a =>
        !employeeIds.includes(a.employeeId)
    );

    saveData();
    refreshAll();
}

// ======================================
// COMPANY DROPDOWN OPTIONS
// ======================================

function updateCompanyOptions() {
    const options = companies.map(c =>
        `<option value="${escapeHTML(c.id)}">
            ${escapeHTML(c.name)}
        </option>`
    ).join("");

    $("employeeCompany").innerHTML =
        `<option value="">Select Company</option>` + options;

    const filters = [
        "employeeCompanyFilter",
        "attendanceCompanyFilter",
        "reportCompanyFilter"
    ];

    filters.forEach(id => {
        const select = $(id);
        const previous = select.value;

        select.innerHTML =
            `<option value="all">All Companies</option>` + options;

        if ([...select.options].some(o => o.value === previous)) {
            select.value = previous;
        }
    });
}

// ======================================
// EMPLOYEE MANAGEMENT
// ======================================

// Add or update employee
$("employeeForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const id = $("employeeId").value;

    const name = $("employeeName").value.trim();
    const email = $("employeeEmail").value.trim();
    const phone = $("employeePhone").value.trim();
    const position = $("employeePosition").value.trim();
    const companyId = $("employeeCompany").value;

    if (!name || !email || !phone || !position || !companyId) {
        alert("Please complete all employee information.");
        return;
    }

    if (!companies.some(c => c.id === companyId)) {
        alert("Please select a valid company.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (!/^[0-9+() -]{7,20}$/.test(phone)) {
        alert("Please enter a valid phone number.");
        return;
    }

    const duplicate = employees.some(e =>
        e.email.toLowerCase() === email.toLowerCase() &&
        e.id !== id
    );

    if (duplicate) {
        alert("This email is already registered.");
        return;
    }

    if (id) {
        const employee = employees.find(e => e.id === id);

        if (employee) {
            employee.name = name;
            employee.email = email;
            employee.phone = phone;
            employee.position = position;
            employee.companyId = companyId;
        }
    } else {
        employees.push({
            id: createId(),
            name,
            email,
            phone,
            position,
            companyId
        });
    }

    saveData();
    resetEmployeeForm();
    refreshAll();

    alert("Employee record saved successfully!");
});

// Display employees
function renderEmployees() {
    const search = $("employeeSearch").value.toLowerCase();
    const companyFilter = $("employeeCompanyFilter").value;
    const sort = $("employeeSort").value;

    let list = employees.filter(e => {
        const matchesSearch = [
            e.name, e.email, e.phone, e.position,
            getCompanyName(e.companyId)
        ].some(value =>
            String(value).toLowerCase().includes(search)
        );

        const matchesCompany =
            companyFilter === "all" ||
            e.companyId === companyFilter;

        return matchesSearch && matchesCompany;
    });

    if (sort === "name") {
        list.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sort === "nameDesc") {
        list.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (sort === "company") {
        list.sort((a, b) =>
            getCompanyName(a.companyId).localeCompare(
                getCompanyName(b.companyId)
            )
        );
    }

    $("employeeTable").innerHTML = list.map(e => `
        <tr>
            <td>${escapeHTML(e.name)}</td>
            <td>${escapeHTML(e.email)}</td>
            <td>${escapeHTML(e.phone)}</td>
            <td>${escapeHTML(e.position)}</td>
            <td>${escapeHTML(getCompanyName(e.companyId))}</td>
            <td>
                <button class="edit"
                    onclick="editEmployee('${e.id}')">
                    Edit
                </button>

                <button class="delete"
                    onclick="deleteEmployee('${e.id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join("") || `
        <tr><td colspan="6">No employees found.</td></tr>
    `;
}

// Edit employee
function editEmployee(id) {
    const e = employees.find(e => e.id === id);

    if (!e) return;

    $("employeeId").value = e.id;
    $("employeeName").value = e.name;
    $("employeeEmail").value = e.email;
    $("employeePhone").value = e.phone;
    $("employeePosition").value = e.position;
    $("employeeCompany").value = e.companyId;

    $("employeeSubmit").textContent = "Update Employee";
    $("cancelEmployeeEdit").classList.remove("hidden");

    showPage("employees");
    $("employeeName").focus();
}

// Reset employee form
function resetEmployeeForm() {
    $("employeeForm").reset();
    $("employeeId").value = "";
    $("employeeSubmit").textContent = "Add Employee";
    $("cancelEmployeeEdit").classList.add("hidden");
}

$("cancelEmployeeEdit").addEventListener(
    "click", resetEmployeeForm
);

// Delete employee
function deleteEmployee(id) {
    const e = employees.find(e => e.id === id);

    if (!e) return;

    if (!confirm(`Delete employee ${e.name}?`)) return;

    employees = employees.filter(e => e.id !== id);

    attendance = attendance.filter(a =>
        a.employeeId !== id
    );

    saveData();
    refreshAll();
}

// Search and filter employee records
$("employeeSearch").addEventListener("input", renderEmployees);
$("employeeCompanyFilter").addEventListener("change", renderEmployees);
$("employeeSort").addEventListener("change", renderEmployees);

// ======================================
// ATTENDANCE MONITORING
// ======================================

$("attendanceDate").value = getToday();

// Display attendance
function renderAttendance() {
    const date = $("attendanceDate").value;
    const companyFilter = $("attendanceCompanyFilter").value;
    const search = $("attendanceSearch").value.toLowerCase();
    const statusFilter = $("attendanceStatusFilter").value;

    let list = employees.filter(e => {
        const matchesCompany =
            companyFilter === "all" ||
            e.companyId === companyFilter;

        const matchesSearch =
            e.name.toLowerCase().includes(search);

        const record = getAttendance(e.id, date);

        const status = record ? record.status : "Not Recorded";

        const matchesStatus =
            statusFilter === "all" ||
            status === statusFilter;

        return matchesCompany && matchesSearch && matchesStatus;
    });

    $("attendanceTable").innerHTML = list.map(e => {
        const record = getAttendance(e.id, date);
        const status = record ? record.status : "Not Recorded";

        return `
            <tr>
                <td>${escapeHTML(e.name)}</td>
                <td>${escapeHTML(getCompanyName(e.companyId))}</td>
                <td>
                    <select
                        aria-label="Attendance status for ${escapeHTML(e.name)}"
                        onchange="updateAttendance(
                            '${e.id}', this.value
                        )">

                        <option value="Not Recorded"
                            ${status === "Not Recorded" ? "selected" : ""}>
                            Not Recorded
                        </option>

                        <option value="Present"
                            ${status === "Present" ? "selected" : ""}>
                            Present
                        </option>

                        <option value="Absent"
                            ${status === "Absent" ? "selected" : ""}>
                            Absent
                        </option>

                        <option value="Leave"
                            ${status === "Leave" ? "selected" : ""}>
                            Leave
                        </option>
                    </select>
                </td>
            </tr>
        `;
    }).join("") || `
        <tr><td colspan="3">No matching employees.</td></tr>
    `;
}

// Update attendance status
function updateAttendance(employeeId, status) {
    const date = $("attendanceDate").value;

    if (!date || date > getToday()) {
        alert("Please select a valid date (today or earlier).");
        renderAttendance();
        return;
    }

    const employee = employees.find(e => e.id === employeeId);

    if (!employee) {
        alert("Employee not found.");
        return;
    }

    let record = getAttendance(employeeId, date);

    if (status === "Not Recorded") {
        attendance = attendance.filter(a =>
            !(a.employeeId === employeeId && a.date === date)
        );
    } else {
        if (!["Present", "Absent", "Leave"].includes(status)) {
            alert("Invalid attendance status.");
            return;
        }

        if (record) {
            record.status = status;
        } else {
            attendance.push({
                id: createId(),
                employeeId,
                date,
                status
            });
        }
    }

    saveData();
    refreshAll();
}

// Attendance filters
$("attendanceDate").addEventListener("change", renderAttendance);
$("attendanceCompanyFilter").addEventListener("change", renderAttendance);
$("attendanceSearch").addEventListener("input", renderAttendance);
$("attendanceStatusFilter").addEventListener("change", renderAttendance);

// ======================================
// DASHBOARD CALCULATIONS
// ======================================

function renderDashboard() {
    const today = getToday();

    const records = attendance.filter(a => a.date === today);

    const countStatus = status =>
        records.filter(a => a.status === status).length;

    $("totalCompanies").textContent = companies.length;
    $("totalEmployees").textContent = employees.length;
    $("totalPresent").textContent = countStatus("Present");
    $("totalAbsent").textContent = countStatus("Absent");
    $("totalLeave").textContent = countStatus("Leave");

    $("dashboardTable").innerHTML = companies.map(c => {
        const companyEmployees = employees.filter(e =>
            e.companyId === c.id
        );

        const companyIds = companyEmployees.map(e => e.id);

        const companyRecords = records.filter(a =>
            companyIds.includes(a.employeeId)
        );

        return `
            <tr>
                <td>${escapeHTML(c.name)}</td>
                <td>${companyEmployees.length}</td>
                <td>${companyRecords.filter(a =>
                    a.status === "Present"
                ).length}</td>
                <td>${companyRecords.filter(a =>
                    a.status === "Absent"
                ).length}</td>
                <td>${companyRecords.filter(a =>
                    a.status === "Leave"
                ).length}</td>
            </tr>
        `;
    }).join("") || `
        <tr><td colspan="5">No company records.</td></tr>
    `;
}

// ======================================
// ATTENDANCE REPORTS
// ======================================

$("reportDate").value = getToday();

function renderReports() {
    const date = $("reportDate").value;
    const companyFilter = $("reportCompanyFilter").value;

    let records = attendance.filter(a => a.date === date);

    records = records.filter(a => {
        const employee = employees.find(e =>
            e.id === a.employeeId
        );

        return employee &&
            (companyFilter === "all" ||
            employee.companyId === companyFilter);
    });

    $("reportTotal").textContent = records.length;

    $("reportPresent").textContent =
        records.filter(a => a.status === "Present").length;

    $("reportAbsent").textContent =
        records.filter(a => a.status === "Absent").length;

    $("reportLeave").textContent =
        records.filter(a => a.status === "Leave").length;

    $("reportTable").innerHTML = records.map(a => {
        const e = employees.find(e => e.id === a.employeeId);

        return `
            <tr>
                <td>${escapeHTML(a.date)}</td>
                <td>${escapeHTML(e.name)}</td>
                <td>${escapeHTML(getCompanyName(e.companyId))}</td>
                <td>
                    <span class="status ${escapeHTML(a.status)}">
                        ${escapeHTML(a.status)}
                    </span>
                </td>
            </tr>
        `;
    }).join("") || `
        <tr><td colspan="4">No attendance records found.</td></tr>
    `;
}

$("reportDate").addEventListener("change", renderReports);
$("reportCompanyFilter").addEventListener("change", renderReports);

// ======================================
// EXPORT CSV REPORT
// ======================================

function exportCSV() {
    const date = $("reportDate").value;
    const companyFilter = $("reportCompanyFilter").value;

    if (!date) {
        alert("Please select a report date.");
        return;
    }

    const records = attendance.filter(a => {
        const e = employees.find(e => e.id === a.employeeId);

        return a.date === date &&
            e &&
            (companyFilter === "all" ||
            e.companyId === companyFilter);
    });

    if (records.length === 0) {
        alert("There are no attendance records to export.");
        return;
    }

    const rows = [
        ["Date", "Employee Name", "Company", "Status"]
    ];

    records.forEach(a => {
        const e = employees.find(e => e.id === a.employeeId);

        rows.push([
            a.date,
            e.name,
            getCompanyName(e.companyId),
            a.status
        ]);
    });

    // Prepare CSV data
    const csv = rows.map(row =>
        row.map(value =>
            '"' + String(value).replace(/"/g, '""') + '"'
        ).join(",")
    ).join("\r\n");

    // Download file
    const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Attendance_Report_" + date + ".csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

// ======================================
// REFRESH ALL SYSTEM INFORMATION
// ======================================

function refreshAll() {
    renderCompanies();
    renderEmployees();
    renderAttendance();
    renderDashboard();
    renderReports();
}

// ======================================
// INITIALIZE SYSTEM
// ======================================

// Display current date
$("today").textContent = new Date().toLocaleDateString(
    "en-PH",
    {
        year: "numeric",
        month: "long",
        day: "numeric"
    }
);

// Save initial data
saveData();

// Load system
refreshAll();

// Show dashboard first
showPage("dashboard");