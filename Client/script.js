/* ==========================================
            SCRIPT.JS
   RASHID DENTAL CLINIC - FULL BACKEND CONNECTION
========================================== */


/* ==========================
      API BASE URL
========================== */

const API_BASE_URL = "http://localhost:5000/api";


/* ==========================
      HELPERS
========================== */

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": "Bearer " + token } : {})
    };
}

function getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

function requireLogin() {
    if (!localStorage.getItem("token")) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function statusBadge(status) {
    const cls = (status || "").toLowerCase();
    return "<span class='status " + cls + "'>" + status + "</span>";
}

function formatDate(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d)) return value;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/* Convert a 24h "HH:MM" value into "hh:mm AM/PM" for display */
function formatTime12(value) {
    if (!value) return "-";
    const parts = value.split(":");
    if (parts.length < 2) return value;
    let hh = parseInt(parts[0], 10);
    const mm = parts[1];
    const suffix = hh >= 12 ? "PM" : "AM";
    hh = hh % 12;
    if (hh === 0) hh = 12;
    return String(hh).padStart(2, "0") + ":" + mm + " " + suffix;
}


/* ==========================================
   GENERIC MODAL (used for Add/Edit/View
   dialogs on admin pages - self-contained,
   no extra CSS file needed)
========================================== */

function promptForm(title, fields) {

    return new Promise(function (resolve) {

        const overlay = document.createElement("div");
        overlay.style.cssText =
            "position:fixed;inset:0;background:rgba(0,0,0,0.55);display:flex;" +
            "align-items:center;justify-content:center;z-index:9999;padding:20px;";

        const box = document.createElement("div");
        box.style.cssText =
            "background:#fff;padding:24px;border-radius:10px;max-width:440px;" +
            "width:100%;max-height:85vh;overflow:auto;box-shadow:0 10px 40px rgba(0,0,0,0.3);";

        let html = "<h3 style='margin-top:0;'>" + title + "</h3><form id='modalForm_'>";

        fields.forEach(function (f) {

            html += "<div style='margin-bottom:14px;'>";
            html += "<label style='display:block;margin-bottom:5px;font-weight:600;'>" + f.label + "</label>";

            if (f.type === "select") {

                html += "<select id='modal_" + f.id + "' style='width:100%;padding:9px;border:1px solid #ccc;border-radius:6px;'" + (f.required ? " required" : "") + ">";

                f.options.forEach(function (opt) {

                    const val = (opt && typeof opt === "object") ? opt.value : opt;
                    const text = (opt && typeof opt === "object") ? opt.text : opt;
                    const sel = (f.value !== undefined && String(f.value) === String(val)) ? " selected" : "";

                    html += "<option value='" + val + "'" + sel + ">" + text + "</option>";

                });

                html += "</select>";

            } else if (f.type === "textarea") {

                html += "<textarea id='modal_" + f.id + "' rows='3' style='width:100%;padding:9px;border:1px solid #ccc;border-radius:6px;box-sizing:border-box;'" + (f.required ? " required" : "") + ">" + (f.value || "") + "</textarea>";

            } else {

                html += "<input type='" + f.type + "' id='modal_" + f.id + "' value='" + (f.value !== undefined ? f.value : "") + "' step='" + (f.step || "any") + "' style='width:100%;padding:9px;border:1px solid #ccc;border-radius:6px;box-sizing:border-box;'" + (f.required ? " required" : "") + ">";

            }

            html += "</div>";

        });

        html += "<div style='display:flex;gap:10px;justify-content:flex-end;margin-top:10px;'>";
        html += "<button type='button' class='btn' id='modalCancelBtn_'>Cancel</button>";
        html += "<button type='submit' class='btn'>Save</button>";
        html += "</div></form>";

        box.innerHTML = html;
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        const form = box.querySelector("#modalForm_");
        const cancelBtn = box.querySelector("#modalCancelBtn_");

        function close(result) {
            overlay.remove();
            resolve(result);
        }

        cancelBtn.addEventListener("click", function () { close(null); });

        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) close(null);
        });

        form.addEventListener("submit", function (e) {

            e.preventDefault();

            const values = {};

            fields.forEach(function (f) {
                const el = box.querySelector("#modal_" + f.id);
                values[f.id] = el.value;
            });

            close(values);

        });

    });

}

function showInfoModal(title, rows) {

    const overlay = document.createElement("div");
    overlay.style.cssText =
        "position:fixed;inset:0;background:rgba(0,0,0,0.55);display:flex;" +
        "align-items:center;justify-content:center;z-index:9999;padding:20px;";

    const box = document.createElement("div");
    box.style.cssText =
        "background:#fff;padding:24px;border-radius:10px;max-width:440px;" +
        "width:100%;max-height:85vh;overflow:auto;box-shadow:0 10px 40px rgba(0,0,0,0.3);";

    let html = "<h3 style='margin-top:0;'>" + title + "</h3>";

    rows.forEach(function (row) {

        html += "<p style='margin:8px 0;'><strong>" + row[0] + ":</strong> " + row[1] + "</p>";

    });

    html += "<div style='text-align:right;margin-top:14px;'><button class='btn' id='infoCloseBtn_'>Close</button></div>";

    box.innerHTML = html;
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    function close() { overlay.remove(); }

    box.querySelector("#infoCloseBtn_").addEventListener("click", close);

    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) close();
    });

}


/* ==========================
      LOGOUT (any page)
========================== */

document.querySelectorAll(".logout-btn, #logoutBtn").forEach(function (btn) {

    btn.addEventListener("click", function (event) {

        event.preventDefault();

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "login.html";

    });

});


/* ==========================
      CURRENT YEAR
========================== */

const footer = document.querySelector("footer p");

if (footer) {

    const year = new Date().getFullYear();

    footer.innerHTML = "&copy; " + year + " Rashid Dental Clinic. All Rights Reserved.";

}


/* ==========================
      SMOOTH SCROLL
========================== */

document.querySelectorAll('a[href^="#"]').forEach(function (link) {

    link.addEventListener("click", function (event) {

        event.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) target.scrollIntoView({ behavior: "smooth" });

    });

});


/* ==========================
      ACTIVE NAVIGATION
========================== */

const navLinks = document.querySelectorAll("nav ul li a");

navLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        navLinks.forEach(function (item) { item.classList.remove("active"); });

        this.classList.add("active");

    });

});


/* ==========================
      BUTTON HOVER EFFECT
========================== */

document.querySelectorAll(".btn").forEach(function (button) {

    button.addEventListener("mouseenter", function () { this.style.transform = "scale(1.05)"; });

    button.addEventListener("mouseleave", function () { this.style.transform = "scale(1)"; });

});


/* ==========================
      SCROLL TO TOP CLASS
========================== */

window.addEventListener("scroll", function () {

    document.body.classList.toggle("scrolling", window.scrollY > 200);

});


/* ==========================================
        LOGIN FORM  ->  POST /api/auth/login
========================================== */

const loginForm = document.querySelector(".login-container form");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const role = document.getElementById("role");
        const email = document.getElementById("email");
        const password = document.getElementById("password");

        if (role && role.value === "") {
            alert("Please select whether you are logging in as Patient or Administrator.");
            role.focus();
            return;
        }

        if (email.value.trim() === "") {
            alert("Please enter your email address.");
            email.focus();
            return;
        }

        if (password.value.trim() === "") {
            alert("Please enter your password.");
            password.focus();
            return;
        }

        try {

            const response = await fetch(API_BASE_URL + "/auth/login", {

                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.value.trim(),
                    password: password.value
                })

            });

            const data = await response.json();

            if (data.success) {

                if (role && role.value !== data.data.role) {

                    alert(
                        "This account is registered as '" + data.data.role +
                        "', not '" + role.value + "'. Logging you in with the correct role."
                    );

                }

                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.data));

                alert("Login Successful.");

                window.location.href = data.data.role === "admin"
                    ? "admin-dashboard.html"
                    : "patient-dashboard.html";

            } else {

                alert(data.message || "Login failed.");

            }

        } catch (error) {

            console.error("Login Error:", error);
            alert("Unable to connect to the server. Please make sure the backend is running.");

        }

    });

}


/* ==========================================
     REGISTER FORM -> POST /api/auth/register
========================================== */

const registerForm = document.querySelector(".register-container form");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const fullname = document.getElementById("fullname");
        const email = document.getElementById("email");
        const phone = document.getElementById("phone");
        const gender = document.getElementById("gender");
        const dob = document.getElementById("dob");
        const address = document.getElementById("address");
        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirmPassword");

        if (fullname.value.trim() === "") {
            alert("Please enter your full name.");
            fullname.focus();
            return;
        }

        if (email.value.trim() === "") {
            alert("Please enter your email.");
            email.focus();
            return;
        }

        const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/i;

        if (!emailPattern.test(email.value)) {
            alert("Please enter a valid email address.");
            email.focus();
            return;
        }

        if (phone.value.trim().length < 11) {
            alert("Enter a valid phone number.");
            phone.focus();
            return;
        }

        if (gender && gender.value === "") {
            alert("Please select your gender.");
            gender.focus();
            return;
        }

        if (password.value.length < 8) {
            alert("Password must be at least 8 characters.");
            password.focus();
            return;
        }

        if (password.value !== confirmPassword.value) {
            alert("Passwords do not match.");
            confirmPassword.focus();
            return;
        }

        try {

            const response = await fetch(API_BASE_URL + "/auth/register", {

                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: fullname.value.trim(),
                    email: email.value.trim(),
                    phone: phone.value.trim(),
                    password: password.value,
                    gender: gender ? gender.value : undefined,
                    dateOfBirth: dob ? dob.value : undefined,
                    address: address ? address.value.trim() : undefined
                })

            });

            const data = await response.json();

            if (data.success) {

                alert("Registration Successful. Please login.");
                registerForm.reset();
                window.location.href = "login.html";

            } else {

                alert(data.message || "Registration failed.");

            }

        } catch (error) {

            console.error("Register Error:", error);
            alert("Unable to connect to the server. Please make sure the backend is running.");

        }

    });

}


/* ==========================================
   PUBLIC DOCTORS LISTING (doctors.html + home.html)
   GET /api/doctors
========================================== */

const doctorsListEl = document.getElementById("doctorsList");
const homeDoctorsListEl = document.getElementById("homeDoctorsList");

if (doctorsListEl || homeDoctorsListEl) {

    (async function loadDoctorsPublic() {

        try {

            const response = await fetch(API_BASE_URL + "/doctors");
            const data = await response.json();

            if (!data.success || !Array.isArray(data.data)) return;

            const doctors = data.data.filter(function (d) { return d.status !== "Inactive"; });

            if (doctorsListEl) {

                doctorsListEl.innerHTML = "";

                if (doctors.length === 0) {
                    doctorsListEl.innerHTML = "<p>No doctors available right now.</p>";
                }

                doctors.forEach(function (doc) {

                    const card = document.createElement("div");
                    card.className = "doctor-card";

                    card.innerHTML =
                        "<img src='" + (doc.image || "../images/doctor1.jpg") + "' alt='" + doc.name + "'>" +
                        "<h2>" + doc.name + "</h2>" +
                        "<h4>" + doc.specialty + "</h4>" +
                        "<p>" + (doc.bio || "") + "</p>" +
                        "<p><strong>Experience:</strong> " + (doc.experience || 0) + " years</p>" +
                        "<a href='appointment.html' class='btn'>Book Appointment</a>";

                    doctorsListEl.appendChild(card);

                });

            }

            if (homeDoctorsListEl) {

                homeDoctorsListEl.innerHTML = "";

                doctors.slice(0, 3).forEach(function (doc) {

                    const card = document.createElement("div");
                    card.className = "doctor-card";

                    card.innerHTML =
                        "<img src='" + (doc.image || "../images/doctor1.jpg") + "' alt='" + doc.name + "'>" +
                        "<h3>" + doc.name + "</h3>" +
                        "<p>" + doc.specialty + "</p>";

                    homeDoctorsListEl.appendChild(card);

                });

            }

        } catch (error) {

            console.error("Failed to load doctors:", error);

        }

    })();

}


/* ==========================================
   PUBLIC SERVICES LISTING (services.html + home.html)
   GET /api/services
========================================== */

const servicesListEl = document.getElementById("servicesList");
const homeServicesListEl = document.getElementById("homeServicesList");

if (servicesListEl || homeServicesListEl) {

    (async function loadServicesPublic() {

        try {

            const response = await fetch(API_BASE_URL + "/services");
            const data = await response.json();

            if (!data.success || !Array.isArray(data.data)) return;

            const services = data.data.filter(function (s) { return s.status !== "Inactive"; });

            if (servicesListEl) {

                servicesListEl.innerHTML = "";

                if (services.length === 0) {
                    servicesListEl.innerHTML = "<p>No services available right now.</p>";
                }

                services.forEach(function (svc) {

                    const card = document.createElement("div");
                    card.className = "service-card";

                    card.innerHTML =
                        "<h2>" + svc.name + "</h2>" +
                        "<p>" + (svc.description || "") + "</p>" +
                        "<p><strong>Duration:</strong> " + svc.duration + "</p>" +
                        "<p><strong>Price:</strong> Rs. " + svc.price + "</p>" +
                        "<a href='appointment.html' class='btn'>Book Appointment</a>";

                    servicesListEl.appendChild(card);

                });

            }

            if (homeServicesListEl) {

                homeServicesListEl.innerHTML = "";

                services.slice(0, 3).forEach(function (svc) {

                    const card = document.createElement("div");
                    card.className = "service-card";

                    card.innerHTML = "<h3>" + svc.name + "</h3><p>" + (svc.description || "") + "</p>";

                    homeServicesListEl.appendChild(card);

                });

            }

        } catch (error) {

            console.error("Failed to load services:", error);

        }

    })();

}


/* ==========================================
   APPOINTMENT BOOKING FORM (appointment.html)
   Dropdowns from backend + POST /api/appointments
========================================== */

const appointmentForm = document.querySelector(".appointment-form form");

if (appointmentForm) {

    const doctorSelect = document.getElementById("doctor");
    const serviceSelect = document.getElementById("service");

    // Prefill name/email/phone if the patient is logged in
    const currentUser = getCurrentUser();

    if (currentUser) {

        const nameEl = document.getElementById("name");
        const emailEl = document.getElementById("email");
        const phoneEl = document.getElementById("phone");

        if (nameEl && !nameEl.value) nameEl.value = currentUser.name || "";
        if (emailEl && !emailEl.value) emailEl.value = currentUser.email || "";
        if (phoneEl && phoneEl.value === "" && currentUser.phone) phoneEl.value = currentUser.phone;

    }

    (async function loadDoctorsForBooking() {

        try {

            const response = await fetch(API_BASE_URL + "/doctors");
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {

                data.data.filter(function (d) { return d.status !== "Inactive"; }).forEach(function (doc) {

                    const option = document.createElement("option");
                    option.value = doc._id;
                    option.textContent = doc.name + " - " + doc.specialty;
                    doctorSelect.appendChild(option);

                });

            }

        } catch (error) {
            console.error("Failed to load doctors:", error);
        }

    })();

    (async function loadServicesForBooking() {

        try {

            const response = await fetch(API_BASE_URL + "/services");
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {

                data.data.filter(function (s) { return s.status !== "Inactive"; }).forEach(function (svc) {

                    const option = document.createElement("option");
                    option.value = svc._id;
                    option.textContent = svc.name + " (" + svc.duration + ")";
                    serviceSelect.appendChild(option);

                });

            }

        } catch (error) {
            console.error("Failed to load services:", error);
        }

    })();

    appointmentForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const service = document.getElementById("service");
        const doctor = document.getElementById("doctor");
        const date = document.getElementById("date");
        const time = document.getElementById("time");
        const reason = document.getElementById("reason");

        if (service && service.value === "") {
            alert("Please select a dental service.");
            service.focus();
            return;
        }

        if (doctor && doctor.value === "") {
            alert("Please select a doctor.");
            doctor.focus();
            return;
        }

        if (date && date.value === "") {
            alert("Please select appointment date.");
            date.focus();
            return;
        }

        const selectedDate = new Date(date.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            alert("You cannot book an appointment for a past date.");
            date.focus();
            return;
        }

        if (time && time.value === "") {
            alert("Please select appointment time.");
            time.focus();
            return;
        }

        if (reason && reason.value.trim() === "") {
            alert("Please enter reason for visit.");
            reason.focus();
            return;
        }

        if (!requireLogin()) {
            alert("Please login before booking an appointment.");
            return;
        }

        // time.value is 24-hour "HH:MM" (see the value attributes added
        // to the <option> tags). End time = start + 30 minutes.
        const startTime = time.value;
        const [hh, mm] = startTime.split(":").map(Number);
        const endDate = new Date();
        endDate.setHours(hh, mm + 30, 0, 0);
        const endTime =
            String(endDate.getHours()).padStart(2, "0") + ":" +
            String(endDate.getMinutes()).padStart(2, "0");

        try {

            const response = await fetch(API_BASE_URL + "/appointments", {

                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    doctor: doctor.value,
                    service: service.value,
                    appointmentDate: date.value,
                    startTime: startTime,
                    endTime: endTime,
                    reason: reason.value.trim()
                })

            });

            const data = await response.json();

            if (data.success) {

                alert("Appointment request submitted successfully.");
                appointmentForm.reset();

            } else {

                alert(data.message || "Could not book appointment.");

            }

        } catch (error) {

            console.error("Appointment Error:", error);
            alert("Unable to connect to the server. Please make sure the backend is running.");

        }

    });

}


/* ==========================================
   PATIENT DASHBOARD (patient-dashboard.html)
   Stats + upcoming appointment computed from
   GET /api/appointments/my
========================================== */

const upcomingTable = document.getElementById("upcomingAppointmentTable");
const dashboardWelcome = document.getElementById("dashboardWelcome");

if (upcomingTable || dashboardWelcome) {

    requireLogin();

    const user = getCurrentUser();

    if (dashboardWelcome && user) {
        dashboardWelcome.textContent = "Welcome, " + user.name;
    }

    (async function loadPatientDashboard() {

        try {

            const response = await fetch(API_BASE_URL + "/appointments/my", {
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!data.success) return;

            const appts = data.data;

            const total = appts.length;
            const pending = appts.filter(function (a) { return a.status === "Pending"; }).length;
            const confirmed = appts.filter(function (a) { return a.status === "Confirmed"; }).length;
            const completed = appts.filter(function (a) { return a.status === "Completed"; }).length;

            const setStat = function (id, value) {
                const el = document.getElementById(id);
                if (el) el.textContent = String(value).padStart(2, "0");
            };

            setStat("statTotalAppointments", total);
            setStat("statPending", pending);
            setStat("statConfirmed", confirmed);
            setStat("statCompleted", completed);

            if (upcomingTable) {

                const rows = upcomingTable.querySelectorAll("tr");
                for (let i = 1; i < rows.length; i++) rows[i].remove();

                const upcoming = appts
                    .filter(function (a) { return a.status === "Pending" || a.status === "Confirmed"; })
                    .sort(function (a, b) { return new Date(a.appointmentDate) - new Date(b.appointmentDate); })[0];

                const row = document.createElement("tr");

                if (upcoming) {

                    row.innerHTML =
                        "<td>" + (upcoming.doctor ? upcoming.doctor.name : "-") + "</td>" +
                        "<td>" + (upcoming.service ? upcoming.service.name : "-") + "</td>" +
                        "<td>" + formatDate(upcoming.appointmentDate) + "</td>" +
                        "<td>" + formatTime12(upcoming.startTime) + "</td>" +
                        "<td>" + statusBadge(upcoming.status) + "</td>";

                } else {

                    row.innerHTML = "<td colspan='5'>You have no upcoming appointments.</td>";

                }

                upcomingTable.appendChild(row);

            }

        } catch (error) {

            console.error("Dashboard load error:", error);

        }

    })();

}


/* ==========================================
   MY APPOINTMENTS (my-appointments.html)
   GET /api/appointments/my
   PUT /api/appointments/cancel/:id
========================================== */

const myAppointmentsTable = document.querySelector("#myAppointmentsTable tbody");

if (myAppointmentsTable) {

    requireLogin();

    (async function loadMyAppointments() {

        try {

            const response = await fetch(API_BASE_URL + "/appointments/my", {
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!data.success) return;

            myAppointmentsTable.innerHTML = "";

            if (data.data.length === 0) {
                myAppointmentsTable.innerHTML = "<tr><td colspan='7'>You have no appointments yet.</td></tr>";
                return;
            }

            data.data.forEach(function (appt) {

                const row = document.createElement("tr");
                row.setAttribute("data-id", appt._id);

                row.innerHTML =
                    "<td>" + appt._id.slice(-6).toUpperCase() + "</td>" +
                    "<td>" + (appt.doctor ? appt.doctor.name : "-") + "</td>" +
                    "<td>" + (appt.service ? appt.service.name : "-") + "</td>" +
                    "<td>" + formatDate(appt.appointmentDate) + "</td>" +
                    "<td>" + formatTime12(appt.startTime) + "</td>" +
                    "<td>" + statusBadge(appt.status) + "</td>" +
                    "<td>" +
                    "<a href='appointment-detail.html?id=" + appt._id + "' class='btn'>View</a> " +
                    ((appt.status === "Pending" || appt.status === "Confirmed")
                        ? "<button class='btn cancel-appointment-btn'>Cancel</button>"
                        : "") +
                    "</td>";

                myAppointmentsTable.appendChild(row);

            });

            attachCancelHandlers();

        } catch (error) {

            console.error("Load my appointments error:", error);

        }

    })();

}

function attachCancelHandlers() {

    document.querySelectorAll(".cancel-appointment-btn").forEach(function (btn) {

        btn.addEventListener("click", async function () {

            const row = this.closest("tr[data-id]");
            if (!row) return;

            const id = row.getAttribute("data-id");

            if (!confirm("Cancel this appointment?")) return;

            try {

                const response = await fetch(API_BASE_URL + "/appointments/cancel/" + id, {
                    method: "PUT",
                    headers: getAuthHeaders()
                });

                const data = await response.json();

                if (data.success) {

                    alert("Appointment cancelled successfully.");

                    const statusCell = row.children[5];
                    if (statusCell) statusCell.innerHTML = statusBadge("Cancelled");

                    this.remove();

                } else {

                    alert(data.message || "Could not cancel appointment.");

                }

            } catch (error) {

                console.error("Cancel Error:", error);
                alert("Unable to connect to the server.");

            }

        });

    });

}


/* ==========================================
   APPOINTMENT DETAIL (appointment-detail.html)
   GET /api/appointments/:id
   PUT /api/appointments/cancel/:id
========================================== */

const appointmentDetailTable = document.getElementById("appointmentDetailTable");

if (appointmentDetailTable) {

    requireLogin();

    const params = new URLSearchParams(window.location.search);
    const apptId = params.get("id");

    const cancelBtn = document.getElementById("cancelAppointmentDetailBtn");

    if (!apptId) {

        appointmentDetailTable.innerHTML = "<tr><td>No appointment selected. Go back to My Appointments and click View.</td></tr>";

        if (cancelBtn) cancelBtn.style.display = "none";

    } else {

        (async function loadAppointmentDetail() {

            try {

                const response = await fetch(API_BASE_URL + "/appointments/" + apptId, {
                    headers: getAuthHeaders()
                });

                const data = await response.json();

                if (!data.success || !data.data) {
                    alert("Could not load this appointment.");
                    return;
                }

                const appt = data.data;

                document.getElementById("detailBookingId").textContent = appt._id.slice(-6).toUpperCase();
                document.getElementById("detailPatientName").textContent = appt.patient ? appt.patient.name : "-";
                document.getElementById("detailDoctor").textContent = appt.doctor ? appt.doctor.name : "-";
                document.getElementById("detailService").textContent = appt.service ? appt.service.name : "-";
                document.getElementById("detailDate").textContent = formatDate(appt.appointmentDate);
                document.getElementById("detailTime").textContent = formatTime12(appt.startTime) + " - " + formatTime12(appt.endTime);
                document.getElementById("detailReason").textContent = appt.reason || "-";
                document.getElementById("detailStatus").innerHTML = statusBadge(appt.status);
                document.getElementById("detailCreated").textContent = formatDate(appt.createdAt);

                if (cancelBtn) {

                    if (appt.status === "Pending" || appt.status === "Confirmed") {

                        cancelBtn.addEventListener("click", async function () {

                            if (!confirm("Cancel this appointment?")) return;

                            try {

                                const cancelResponse = await fetch(API_BASE_URL + "/appointments/cancel/" + apptId, {
                                    method: "PUT",
                                    headers: getAuthHeaders()
                                });

                                const cancelData = await cancelResponse.json();

                                if (cancelData.success) {

                                    alert("Appointment cancelled successfully.");
                                    document.getElementById("detailStatus").innerHTML = statusBadge("Cancelled");
                                    cancelBtn.style.display = "none";

                                } else {

                                    alert(cancelData.message || "Could not cancel appointment.");

                                }

                            } catch (error) {

                                console.error("Cancel Error:", error);
                                alert("Unable to connect to the server.");

                            }

                        });

                    } else {

                        cancelBtn.style.display = "none";

                    }

                }

            } catch (error) {

                console.error("Load appointment detail error:", error);

            }

        })();

    }

}


/* ==========================================
   PROFILE PAGE (profile.html)
   GET  /api/auth/profile
   PUT  /api/auth/profile
========================================== */

const profileForm = document.querySelector(".profile-form form");

if (profileForm) {

    requireLogin();

    (async function loadProfile() {

        try {

            const response = await fetch(API_BASE_URL + "/auth/profile", {
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!data.success || !data.data) return;

            const p = data.data;

            document.getElementById("fullname").value = p.name || "";
            document.getElementById("email").value = p.email || "";
            document.getElementById("phone").value = p.phone || "";

            if (p.dateOfBirth) {
                document.getElementById("dob").value = new Date(p.dateOfBirth).toISOString().slice(0, 10);
            }

            if (p.gender) document.getElementById("gender").value = p.gender;

            document.getElementById("address").value = p.address || "";

            const nameHeading = document.getElementById("profileName");
            const roleText = document.getElementById("profileRole");

            if (nameHeading) nameHeading.textContent = p.name || "";
            if (roleText) roleText.textContent = p.role === "admin" ? "Administrator" : "Patient";

            localStorage.setItem("user", JSON.stringify({
                id: p._id, name: p.name, email: p.email, role: p.role
            }));

        } catch (error) {

            console.error("Load profile error:", error);

        }

    })();

    profileForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const fullname = document.getElementById("fullname");
        const email = document.getElementById("email");
        const phone = document.getElementById("phone");
        const dob = document.getElementById("dob");
        const gender = document.getElementById("gender");
        const address = document.getElementById("address");
        const newpassword = document.getElementById("newpassword");
        const confirmpassword = document.getElementById("confirmpassword");

        if (newpassword.value && newpassword.value !== confirmpassword.value) {
            alert("New password and confirm password do not match.");
            confirmpassword.focus();
            return;
        }

        const payload = {
            name: fullname.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            dateOfBirth: dob.value,
            gender: gender.value,
            address: address.value.trim()
        };

        // NOTE: the update-profile endpoint on this backend does not
        // hash the password field before saving. Only send it if the
        // person explicitly typed a new one, and warn them either way.
        if (newpassword.value) {
            payload.password = newpassword.value;
        }

        try {

            const response = await fetch(API_BASE_URL + "/auth/profile", {

                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)

            });

            const data = await response.json();

            if (data.success) {

                alert("Profile updated successfully.");

                localStorage.setItem("user", JSON.stringify({
                    id: data.data._id, name: data.data.name, email: data.data.email, role: data.data.role
                }));

                newpassword.value = "";
                confirmpassword.value = "";

            } else {

                alert(data.message || "Could not update profile.");

            }

        } catch (error) {

            console.error("Update profile error:", error);
            alert("Unable to connect to the server.");

        }

    });

}


/* ==========================================
   ADMIN DASHBOARD (admin-dashboard.html)
   GET /api/admin/dashboard
   GET /api/admin/recent
========================================== */

const recentAppointmentsTable = document.querySelector("#recentAppointmentsTable tbody");
const adminWelcome = document.getElementById("adminWelcome");

if (recentAppointmentsTable || adminWelcome) {

    requireLogin();

    const adminUser = getCurrentUser();

    if (adminWelcome && adminUser) adminWelcome.textContent = "Welcome, " + adminUser.name;

    (async function loadAdminDashboard() {

        try {

            const response = await fetch(API_BASE_URL + "/admin/dashboard", {
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {

                const setStat = function (id, value) {
                    const el = document.getElementById(id);
                    if (el) el.textContent = String(value).padStart(2, "0");
                };

                setStat("statTotalPatients", data.data.totalPatients);
                setStat("statTotalDoctors", data.data.totalDoctors);
                setStat("statTotalAppointments", data.data.totalAppointments);
                setStat("statPendingRequests", data.data.pendingAppointments);

            }

            if (recentAppointmentsTable) {

                const recentResponse = await fetch(API_BASE_URL + "/admin/recent", {
                    headers: getAuthHeaders()
                });

                const recentData = await recentResponse.json();

                if (recentData.success) {

                    recentAppointmentsTable.innerHTML = "";

                    if (recentData.data.length === 0) {
                        recentAppointmentsTable.innerHTML = "<tr><td colspan='5'>No appointments yet.</td></tr>";
                    }

                    recentData.data.forEach(function (appt) {

                        const row = document.createElement("tr");

                        row.innerHTML =
                            "<td>" + appt._id.slice(-6).toUpperCase() + "</td>" +
                            "<td>" + (appt.patient ? appt.patient.name : "-") + "</td>" +
                            "<td>" + (appt.doctor ? appt.doctor.name : "-") + "</td>" +
                            "<td>" + formatDate(appt.appointmentDate) + "</td>" +
                            "<td>" + statusBadge(appt.status) + "</td>";

                        recentAppointmentsTable.appendChild(row);

                    });

                }

            }

        } catch (error) {

            console.error("Admin dashboard load error:", error);

        }

    })();

}


/* ==========================================
   MANAGE APPOINTMENTS (manage-appointments.html)
========================================== */

const adminAppointmentsTable = document.querySelector("#adminAppointmentsTable tbody");

if (adminAppointmentsTable) {

    requireLogin();

    let allAppointments = [];

    const doctorFilter = document.getElementById("apptDoctorFilter");
    const serviceFilter = document.getElementById("apptServiceFilter");
    const statusFilter = document.getElementById("apptStatusFilter");
    const dateFilter = document.getElementById("apptDateFilter");
    const searchInput = document.getElementById("apptSearchInput");
    const searchBtn = document.getElementById("apptSearchBtn");

    const statusEndpointMap = {
        "Confirm": "confirm",
        "Reject": "reject",
        "Completed": "complete",
        "Cancel": "cancel"
    };

    function renderAppointmentsTable(list) {

        adminAppointmentsTable.innerHTML = "";

        if (list.length === 0) {
            adminAppointmentsTable.innerHTML = "<tr><td colspan='8'>No appointments found.</td></tr>";
            return;
        }

        list.forEach(function (appt) {

            const row = document.createElement("tr");
            row.setAttribute("data-id", appt._id);

            row.innerHTML =
                "<td>" + appt._id.slice(-6).toUpperCase() + "</td>" +
                "<td>" + (appt.patient ? appt.patient.name : "-") + "</td>" +
                "<td>" + (appt.doctor ? appt.doctor.name : "-") + "</td>" +
                "<td>" + (appt.service ? appt.service.name : "-") + "</td>" +
                "<td>" + formatDate(appt.appointmentDate) + "</td>" +
                "<td>" + formatTime12(appt.startTime) + "</td>" +
                "<td>" + statusBadge(appt.status) + "</td>" +
                "<td><div class='table-actions'>" +
                "<button class='btn' data-action='Confirm'>Confirm</button>" +
                "<button class='btn' data-action='Reject'>Reject</button>" +
                "<button class='btn' data-action='Completed'>Completed</button>" +
                "<button class='btn' data-action='Cancel'>Cancel</button>" +
                "<button class='btn' data-action='Reschedule'>Reschedule</button>" +
                "</div></td>";

            adminAppointmentsTable.appendChild(row);

        });

        adminAppointmentsTable.querySelectorAll(".table-actions .btn").forEach(function (button) {

            button.addEventListener("click", async function () {

                const action = this.getAttribute("data-action");
                const row = this.closest("tr[data-id]");
                const id = row.getAttribute("data-id");

                if (action === "Reschedule") {

                    const values = await promptForm("Reschedule Appointment", [
                        { id: "appointmentDate", label: "New Date", type: "date", required: true },
                        { id: "startTime", label: "Start Time", type: "time", required: true },
                        { id: "endTime", label: "End Time", type: "time", required: true }
                    ]);

                    if (!values) return;

                    try {

                        const response = await fetch(API_BASE_URL + "/appointments/reschedule/" + id, {
                            method: "PUT",
                            headers: getAuthHeaders(),
                            body: JSON.stringify(values)
                        });

                        const data = await response.json();

                        if (data.success) {
                            alert(data.message);
                            loadAllAppointments();
                        } else {
                            alert(data.message || "Could not reschedule.");
                        }

                    } catch (error) {
                        console.error("Reschedule error:", error);
                        alert("Unable to connect to the server.");
                    }

                    return;

                }

                const endpoint = statusEndpointMap[action];
                if (!endpoint) return;

                try {

                    const response = await fetch(API_BASE_URL + "/appointments/" + endpoint + "/" + id, {
                        method: "PUT",
                        headers: getAuthHeaders()
                    });

                    const data = await response.json();

                    if (data.success) {

                        alert(data.message);

                        const statusCell = row.children[6];
                        if (statusCell) statusCell.innerHTML = statusBadge(data.data.status);

                    } else {

                        alert(data.message || "Action failed.");

                    }

                } catch (error) {

                    console.error("Admin action error:", error);
                    alert("Unable to connect to the server.");

                }

            });

        });

    }

    function applyFilters() {

        const q = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const doc = doctorFilter ? doctorFilter.value : "";
        const svc = serviceFilter ? serviceFilter.value : "";
        const st = statusFilter ? statusFilter.value : "";
        const dt = dateFilter ? dateFilter.value : "";

        const filtered = allAppointments.filter(function (appt) {

            const matchesQuery = !q ||
                appt._id.toLowerCase().includes(q) ||
                (appt.patient && appt.patient.name.toLowerCase().includes(q));

            const matchesDoctor = !doc || (appt.doctor && appt.doctor._id === doc);
            const matchesService = !svc || (appt.service && appt.service._id === svc);
            const matchesStatus = !st || appt.status === st;
            const matchesDate = !dt || (appt.appointmentDate && appt.appointmentDate.slice(0, 10) === dt);

            return matchesQuery && matchesDoctor && matchesService && matchesStatus && matchesDate;

        });

        renderAppointmentsTable(filtered);

    }

    if (searchBtn) searchBtn.addEventListener("click", applyFilters);
    if (searchInput) searchInput.addEventListener("keyup", applyFilters);
    if (doctorFilter) doctorFilter.addEventListener("change", applyFilters);
    if (serviceFilter) serviceFilter.addEventListener("change", applyFilters);
    if (statusFilter) statusFilter.addEventListener("change", applyFilters);
    if (dateFilter) dateFilter.addEventListener("change", applyFilters);

    async function loadFilterOptions() {

        try {

            const [docRes, svcRes] = await Promise.all([
                fetch(API_BASE_URL + "/doctors"),
                fetch(API_BASE_URL + "/services")
            ]);

            const docData = await docRes.json();
            const svcData = await svcRes.json();

            if (doctorFilter && docData.success) {
                docData.data.forEach(function (d) {
                    const opt = document.createElement("option");
                    opt.value = d._id;
                    opt.textContent = d.name;
                    doctorFilter.appendChild(opt);
                });
            }

            if (serviceFilter && svcData.success) {
                svcData.data.forEach(function (s) {
                    const opt = document.createElement("option");
                    opt.value = s._id;
                    opt.textContent = s.name;
                    serviceFilter.appendChild(opt);
                });
            }

        } catch (error) {
            console.error("Load filter options error:", error);
        }

    }

    async function loadAllAppointments() {

        try {

            const response = await fetch(API_BASE_URL + "/appointments", {
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                allAppointments = data.data;
                applyFilters();
            }

        } catch (error) {

            console.error("Load appointments error:", error);

        }

    }

    loadFilterOptions();
    loadAllAppointments();

}


/* ==========================================
   MANAGE DOCTORS (manage-doctors.html)
========================================== */

const doctorsAdminTable = document.querySelector("#doctorsAdminTable tbody");

if (doctorsAdminTable) {

    requireLogin();

    const addDoctorBtn = document.getElementById("addDoctorBtn");

    function doctorFormFields(doc) {

        doc = doc || {};

        return [
            { id: "name", label: "Full Name", type: "text", value: doc.name || "", required: true },
            { id: "specialty", label: "Specialty", type: "text", value: doc.specialty || "", required: true },
            { id: "email", label: "Email", type: "email", value: doc.email || "", required: true },
            { id: "phone", label: "Phone", type: "text", value: doc.phone || "", required: true },
            { id: "experience", label: "Experience (years)", type: "number", value: doc.experience || 0 },
            { id: "bio", label: "Short Bio", type: "textarea", value: doc.bio || "" },
            { id: "image", label: "Image URL", type: "text", value: doc.image || "" },
            {
                id: "status", label: "Status", type: "select", value: doc.status || "Active",
                options: ["Active", "Inactive"]
            }
        ];

    }

    async function loadDoctorsAdmin() {

        try {

            const response = await fetch(API_BASE_URL + "/doctors");
            const data = await response.json();

            if (!data.success) return;

            doctorsAdminTable.innerHTML = "";

            if (data.data.length === 0) {
                doctorsAdminTable.innerHTML = "<tr><td colspan='7'>No doctors yet.</td></tr>";
                return;
            }

            data.data.forEach(function (doc) {

                const row = document.createElement("tr");
                row.setAttribute("data-id", doc._id);

                row.innerHTML =
                    "<td><img src='" + (doc.image || "../images/doctor1.jpg") + "' alt='Doctor' class='table-image'></td>" +
                    "<td>" + doc.name + "</td>" +
                    "<td>" + doc.specialty + "</td>" +
                    "<td>" + (doc.experience || 0) + " yrs</td>" +
                    "<td>" + doc.phone + "</td>" +
                    "<td>" + statusBadge(doc.status) + "</td>" +
                    "<td><div class='table-actions'>" +
                    "<button class='btn' data-action='view'>View</button>" +
                    "<button class='btn' data-action='edit'>Edit</button>" +
                    "<button class='btn' data-action='delete'>Delete</button>" +
                    "</div></td>";

                doctorsAdminTable.appendChild(row);

            });

            doctorsAdminTable.querySelectorAll(".table-actions .btn").forEach(function (button) {

                button.addEventListener("click", async function () {

                    const action = this.getAttribute("data-action");
                    const row = this.closest("tr[data-id]");
                    const id = row.getAttribute("data-id");
                    const doc = data.data.find(function (d) { return d._id === id; });

                    if (action === "view") {

                        showInfoModal(doc.name, [
                            ["Specialty", doc.specialty],
                            ["Email", doc.email],
                            ["Phone", doc.phone],
                            ["Experience", (doc.experience || 0) + " years"],
                            ["Bio", doc.bio || "-"],
                            ["Status", doc.status]
                        ]);

                    } else if (action === "edit") {

                        const values = await promptForm("Edit Doctor", doctorFormFields(doc));
                        if (!values) return;

                        try {

                            const response = await fetch(API_BASE_URL + "/doctors/" + id, {
                                method: "PUT",
                                headers: getAuthHeaders(),
                                body: JSON.stringify(values)
                            });

                            const result = await response.json();

                            if (result.success) {
                                alert("Doctor updated successfully.");
                                loadDoctorsAdmin();
                            } else {
                                alert(result.message || "Could not update doctor.");
                            }

                        } catch (error) {
                            console.error("Update doctor error:", error);
                            alert("Unable to connect to the server.");
                        }

                    } else if (action === "delete") {

                        if (!confirm("Delete this doctor? This cannot be undone.")) return;

                        try {

                            const response = await fetch(API_BASE_URL + "/doctors/" + id, {
                                method: "DELETE",
                                headers: getAuthHeaders()
                            });

                            const result = await response.json();

                            if (result.success !== false) {
                                alert("Doctor deleted successfully.");
                                loadDoctorsAdmin();
                            } else {
                                alert(result.message || "Could not delete doctor.");
                            }

                        } catch (error) {
                            console.error("Delete doctor error:", error);
                            alert("Unable to connect to the server.");
                        }

                    }

                });

            });

        } catch (error) {

            console.error("Load doctors error:", error);

        }

    }

    if (addDoctorBtn) {

        addDoctorBtn.addEventListener("click", async function () {

            const values = await promptForm("Add New Doctor", doctorFormFields());
            if (!values) return;

            try {

                const response = await fetch(API_BASE_URL + "/doctors", {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify(values)
                });

                const result = await response.json();

                if (result.success) {
                    alert("Doctor added successfully.");
                    loadDoctorsAdmin();
                } else {
                    alert(result.message || "Could not add doctor.");
                }

            } catch (error) {
                console.error("Add doctor error:", error);
                alert("Unable to connect to the server.");
            }

        });

    }

    loadDoctorsAdmin();

}


/* ==========================================
   MANAGE SERVICES (manage-services.html)
========================================== */

const servicesAdminTable = document.querySelector("#servicesAdminTable tbody");

if (servicesAdminTable) {

    requireLogin();

    const addServiceBtn = document.getElementById("addServiceBtn");

    function serviceFormFields(svc) {

        svc = svc || {};

        return [
            { id: "name", label: "Service Name", type: "text", value: svc.name || "", required: true },
            { id: "description", label: "Description", type: "textarea", value: svc.description || "" },
            { id: "duration", label: "Duration (e.g. 30 Minutes)", type: "text", value: svc.duration || "30 min" },
            { id: "price", label: "Price (Rs.)", type: "number", value: svc.price || 0 },
            {
                id: "status", label: "Status", type: "select", value: svc.status || "Active",
                options: ["Active", "Inactive"]
            }
        ];

    }

    async function loadServicesAdmin() {

        try {

            const response = await fetch(API_BASE_URL + "/services");
            const data = await response.json();

            if (!data.success) return;

            servicesAdminTable.innerHTML = "";

            if (data.data.length === 0) {
                servicesAdminTable.innerHTML = "<tr><td colspan='6'>No services yet.</td></tr>";
                return;
            }

            data.data.forEach(function (svc) {

                const row = document.createElement("tr");
                row.setAttribute("data-id", svc._id);

                row.innerHTML =
                    "<td>" + svc.name + "</td>" +
                    "<td>" + (svc.description || "-") + "</td>" +
                    "<td>" + svc.duration + "</td>" +
                    "<td>Rs. " + svc.price + "</td>" +
                    "<td>" + statusBadge(svc.status) + "</td>" +
                    "<td><div class='table-actions'>" +
                    "<button class='btn' data-action='view'>View</button>" +
                    "<button class='btn' data-action='edit'>Edit</button>" +
                    "<button class='btn' data-action='delete'>Delete</button>" +
                    "</div></td>";

                servicesAdminTable.appendChild(row);

            });

            servicesAdminTable.querySelectorAll(".table-actions .btn").forEach(function (button) {

                button.addEventListener("click", async function () {

                    const action = this.getAttribute("data-action");
                    const row = this.closest("tr[data-id]");
                    const id = row.getAttribute("data-id");
                    const svc = data.data.find(function (s) { return s._id === id; });

                    if (action === "view") {

                        showInfoModal(svc.name, [
                            ["Description", svc.description || "-"],
                            ["Duration", svc.duration],
                            ["Price", "Rs. " + svc.price],
                            ["Status", svc.status]
                        ]);

                    } else if (action === "edit") {

                        const values = await promptForm("Edit Service", serviceFormFields(svc));
                        if (!values) return;

                        try {

                            const response = await fetch(API_BASE_URL + "/services/" + id, {
                                method: "PUT",
                                headers: getAuthHeaders(),
                                body: JSON.stringify(values)
                            });

                            const result = await response.json();

                            if (result.success) {
                                alert("Service updated successfully.");
                                loadServicesAdmin();
                            } else {
                                alert(result.message || "Could not update service.");
                            }

                        } catch (error) {
                            console.error("Update service error:", error);
                            alert("Unable to connect to the server.");
                        }

                    } else if (action === "delete") {

                        if (!confirm("Delete this service? This cannot be undone.")) return;

                        try {

                            const response = await fetch(API_BASE_URL + "/services/" + id, {
                                method: "DELETE",
                                headers: getAuthHeaders()
                            });

                            const result = await response.json();

                            if (result.success !== false) {
                                alert("Service deleted successfully.");
                                loadServicesAdmin();
                            } else {
                                alert(result.message || "Could not delete service.");
                            }

                        } catch (error) {
                            console.error("Delete service error:", error);
                            alert("Unable to connect to the server.");
                        }

                    }

                });

            });

        } catch (error) {

            console.error("Load services error:", error);

        }

    }

    if (addServiceBtn) {

        addServiceBtn.addEventListener("click", async function () {

            const values = await promptForm("Add New Service", serviceFormFields());
            if (!values) return;

            try {

                const response = await fetch(API_BASE_URL + "/services", {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify(values)
                });

                const result = await response.json();

                if (result.success) {
                    alert("Service added successfully.");
                    loadServicesAdmin();
                } else {
                    alert(result.message || "Could not add service.");
                }

            } catch (error) {
                console.error("Add service error:", error);
                alert("Unable to connect to the server.");
            }

        });

    }

    loadServicesAdmin();

}


/* ==========================================
   MANAGE PATIENTS (manage-patients.html)
========================================== */

const patientsAdminTable = document.querySelector("#patientsAdminTable tbody");

if (patientsAdminTable) {

    requireLogin();

    let allPatients = [];

    const patientSearchInput = document.getElementById("patientSearchInput");
    const patientSearchBtn = document.getElementById("patientSearchBtn");

    function renderPatients(list) {

        patientsAdminTable.innerHTML = "";

        if (list.length === 0) {
            patientsAdminTable.innerHTML = "<tr><td colspan='7'>No patients found.</td></tr>";
            return;
        }

        list.forEach(function (patient) {

            const row = document.createElement("tr");
            row.setAttribute("data-id", patient._id);

            row.innerHTML =
                "<td>" + patient._id.slice(-6).toUpperCase() + "</td>" +
                "<td>" + patient.name + "</td>" +
                "<td>" + patient.email + "</td>" +
                "<td>" + patient.phone + "</td>" +
                "<td>" + formatDate(patient.createdAt) + "</td>" +
                "<td>" + statusBadge(patient.accountStatus) + "</td>" +
                "<td><div class='table-actions'>" +
                "<button class='btn' data-action='view'>View</button>" +
                "<button class='btn' data-action='toggle'>" +
                (patient.accountStatus === "Active" ? "Deactivate" : "Activate") +
                "</button>" +
                "<button class='btn' data-action='delete'>Delete</button>" +
                "</div></td>";

            patientsAdminTable.appendChild(row);

        });

        patientsAdminTable.querySelectorAll(".table-actions .btn").forEach(function (button) {

            button.addEventListener("click", async function () {

                const action = this.getAttribute("data-action");
                const row = this.closest("tr[data-id]");
                const id = row.getAttribute("data-id");
                const patient = allPatients.find(function (p) { return p._id === id; });

                if (action === "view") {

                    showInfoModal(patient.name, [
                        ["Email", patient.email],
                        ["Phone", patient.phone],
                        ["Gender", patient.gender || "-"],
                        ["Address", patient.address || "-"],
                        ["Registered On", formatDate(patient.createdAt)],
                        ["Status", patient.accountStatus]
                    ]);

                } else if (action === "toggle") {

                    const endpoint = patient.accountStatus === "Active" ? "deactivate" : "activate";

                    try {

                        const response = await fetch(API_BASE_URL + "/patients/" + endpoint + "/" + id, {
                            method: "PUT",
                            headers: getAuthHeaders()
                        });

                        const result = await response.json();

                        if (result.success) {
                            alert(result.message);
                            loadPatients();
                        } else {
                            alert(result.message || "Action failed.");
                        }

                    } catch (error) {
                        console.error("Toggle patient status error:", error);
                        alert("Unable to connect to the server.");
                    }

                } else if (action === "delete") {

                    if (!confirm("Delete this patient? This cannot be undone.")) return;

                    try {

                        const response = await fetch(API_BASE_URL + "/patients/" + id, {
                            method: "DELETE",
                            headers: getAuthHeaders()
                        });

                        const result = await response.json();

                        if (result.success !== false) {
                            alert("Patient deleted successfully.");
                            loadPatients();
                        } else {
                            alert(result.message || "Could not delete patient.");
                        }

                    } catch (error) {
                        console.error("Delete patient error:", error);
                        alert("Unable to connect to the server.");
                    }

                }

            });

        });

    }

    function applyPatientFilter() {

        const q = patientSearchInput ? patientSearchInput.value.toLowerCase().trim() : "";

        const filtered = !q ? allPatients : allPatients.filter(function (p) {
            return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
        });

        renderPatients(filtered);

    }

    if (patientSearchBtn) patientSearchBtn.addEventListener("click", applyPatientFilter);
    if (patientSearchInput) patientSearchInput.addEventListener("keyup", applyPatientFilter);

    async function loadPatients() {

        try {

            const response = await fetch(API_BASE_URL + "/patients", {
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                allPatients = data.data;
                applyPatientFilter();
            }

        } catch (error) {

            console.error("Load patients error:", error);

        }

    }

    loadPatients();

}


/* ==========================================
   AVAILABILITY MANAGEMENT (availability.html)
========================================== */

const availabilityTable = document.querySelector("#availabilityTable tbody");
const availabilityForm = document.getElementById("availabilityForm");

if (availabilityTable && availabilityForm) {

    requireLogin();

    let editingId = null;

    const doctorSelect = document.getElementById("doctor");
    const daySelect = document.getElementById("day");
    const startInput = document.getElementById("start");
    const endInput = document.getElementById("end");
    const statusSelect = document.getElementById("status");
    const submitBtn = document.getElementById("availabilitySubmitBtn");
    const cancelEditBtn = document.getElementById("availabilityCancelEditBtn");
    const formTitle = document.getElementById("availabilityFormTitle");
    const addSlotBtn = document.getElementById("addSlotBtn");

    if (addSlotBtn) {
        addSlotBtn.addEventListener("click", function () {
            availabilityForm.scrollIntoView({ behavior: "smooth" });
            doctorSelect.focus();
        });
    }

    (async function loadDoctorsForAvailability() {

        try {

            const response = await fetch(API_BASE_URL + "/doctors");
            const data = await response.json();

            if (data.success) {
                data.data.forEach(function (doc) {
                    const opt = document.createElement("option");
                    opt.value = doc._id;
                    opt.textContent = doc.name;
                    doctorSelect.appendChild(opt);
                });
            }

        } catch (error) {
            console.error("Load doctors error:", error);
        }

    })();

    function resetForm() {

        editingId = null;
        availabilityForm.reset();
        if (formTitle) formTitle.textContent = "Create Availability";
        if (submitBtn) submitBtn.textContent = "Save Availability";
        if (cancelEditBtn) cancelEditBtn.style.display = "none";

    }

    if (cancelEditBtn) cancelEditBtn.addEventListener("click", resetForm);

    async function loadAvailability() {

        try {

            const response = await fetch(API_BASE_URL + "/availability");
            const data = await response.json();

            if (!data.success) return;

            availabilityTable.innerHTML = "";

            if (data.data.length === 0) {
                availabilityTable.innerHTML = "<tr><td colspan='6'>No availability slots yet.</td></tr>";
                return;
            }

            data.data.forEach(function (slot) {

                const row = document.createElement("tr");
                row.setAttribute("data-id", slot._id);

                row.innerHTML =
                    "<td>" + (slot.doctor ? slot.doctor.name : "-") + "</td>" +
                    "<td>" + slot.day + "</td>" +
                    "<td>" + formatTime12(slot.startTime) + "</td>" +
                    "<td>" + formatTime12(slot.endTime) + "</td>" +
                    "<td>" + statusBadge(slot.status) + "</td>" +
                    "<td><div class='table-actions'>" +
                    "<button class='btn' data-action='edit'>Edit</button>" +
                    "<button class='btn' data-action='delete'>Delete</button>" +
                    "</div></td>";

                availabilityTable.appendChild(row);

            });

            availabilityTable.querySelectorAll(".table-actions .btn").forEach(function (button) {

                button.addEventListener("click", async function () {

                    const action = this.getAttribute("data-action");
                    const row = this.closest("tr[data-id]");
                    const id = row.getAttribute("data-id");
                    const slot = data.data.find(function (s) { return s._id === id; });

                    if (action === "edit") {

                        editingId = id;
                        doctorSelect.value = slot.doctor ? slot.doctor._id : "";
                        daySelect.value = slot.day;
                        startInput.value = slot.startTime;
                        endInput.value = slot.endTime;
                        statusSelect.value = slot.status;

                        if (formTitle) formTitle.textContent = "Edit Availability";
                        if (submitBtn) submitBtn.textContent = "Update Availability";
                        if (cancelEditBtn) cancelEditBtn.style.display = "inline-block";

                        availabilityForm.scrollIntoView({ behavior: "smooth" });

                    } else if (action === "delete") {

                        if (!confirm("Delete this availability slot?")) return;

                        try {

                            const response = await fetch(API_BASE_URL + "/availability/" + id, {
                                method: "DELETE",
                                headers: getAuthHeaders()
                            });

                            const result = await response.json();

                            if (result.success !== false) {
                                alert("Availability slot deleted.");
                                loadAvailability();
                            } else {
                                alert(result.message || "Could not delete slot.");
                            }

                        } catch (error) {
                            console.error("Delete availability error:", error);
                            alert("Unable to connect to the server.");
                        }

                    }

                });

            });

        } catch (error) {

            console.error("Load availability error:", error);

        }

    }

    availabilityForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (doctorSelect.value === "") {
            alert("Please select a doctor.");
            return;
        }

        if (!startInput.value || !endInput.value) {
            alert("Please choose a start and end time.");
            return;
        }

        const payload = {
            doctor: doctorSelect.value,
            day: daySelect.value,
            startTime: startInput.value,
            endTime: endInput.value,
            status: statusSelect.value
        };

        try {

            const url = editingId
                ? API_BASE_URL + "/availability/" + editingId
                : API_BASE_URL + "/availability";

            const response = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {

                alert(editingId ? "Availability updated successfully." : "Availability added successfully.");
                resetForm();
                loadAvailability();

            } else {

                alert(data.message || "Could not save availability.");

            }

        } catch (error) {

            console.error("Save availability error:", error);
            alert("Unable to connect to the server.");

        }

    });

    loadAvailability();

}


/* ==========================================
      GENERIC TABLE SEARCH  (fallback for pages
      that only have a plain filter input)
========================================== */

document.querySelectorAll(".filter-section input[type='text']:not(#apptSearchInput):not(#patientSearchInput)").forEach(function (input) {

    input.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();
        const tableRows = document.querySelectorAll(".admin-table tbody tr");

        tableRows.forEach(function (row) {
            row.style.display = row.textContent.toLowerCase().includes(value) ? "" : "none";
        });

    });

});


/* ==========================================
      MOBILE MENU
========================================== */

const menuButton = document.querySelector(".menu-btn");
const navigation = document.querySelector("nav ul");

if (menuButton && navigation) {

    menuButton.addEventListener("click", function () {
        navigation.classList.toggle("show");
    });

}


/* ==========================================
      PASSWORD SHOW/HIDE
========================================== */

document.querySelectorAll('input[type="password"]').forEach(function (input) {

    const button = document.createElement("button");
    button.type = "button";
    button.className = "password-toggle";
    button.innerHTML = "Show";

    input.parentElement.appendChild(button);

    button.addEventListener("click", function () {

        if (input.type === "password") {
            input.type = "text";
            button.innerHTML = "Hide";
        } else {
            input.type = "password";
            button.innerHTML = "Show";
        }

    });

});


/* ==========================================
      LOADING EFFECT
========================================== */

window.addEventListener("load", function () {
    document.body.classList.add("loaded");
});


/* ==========================================
      SCROLL ANIMATION
========================================== */

const animatedItems = document.querySelectorAll(
    ".dashboard-card, .service-card, .doctor-card, .admin-table, .settings-section"
);

const observer = new IntersectionObserver(function (entries) {

    entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add("show");
    });

}, { threshold: 0.2 });

animatedItems.forEach(function (item) { observer.observe(item); });


/* ==========================================
      BACK TO TOP BUTTON
========================================== */

const topButton = document.createElement("button");
topButton.innerHTML = "&uarr;";
topButton.className = "top-button";
document.body.appendChild(topButton);

window.addEventListener("scroll", function () {
    topButton.style.display = window.scrollY > 300 ? "block" : "none";
});

topButton.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});


/* ==========================================
      SUCCESS MESSAGE HELPER
========================================== */

function showMessage(message) {

    const box = document.createElement("div");
    box.className = "message-box";
    box.innerHTML = message;
    document.body.appendChild(box);

    setTimeout(function () { box.remove(); }, 3000);

}
