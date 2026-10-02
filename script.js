// ================= ELEMENTOS DEL DOM =================
const card = document.getElementById('card');
const formRegister = document.getElementById('form-register');
const formLogin = document.getElementById('form-login');
const formForgot = document.getElementById('form-forgot');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toast-text');
const toastIcon = toast.querySelector('i');

const regName = document.getElementById('reg-name');
const regEmail = document.getElementById('reg-email');
const regPhone = document.getElementById('reg-phone');
const regAge = document.getElementById('reg-age');
const regCareer = document.getElementById('reg-career');
const regPassword = document.getElementById('reg-password');
const regConfirm = document.getElementById('reg-confirm');
const passRules = document.querySelectorAll('#pass-rules li');
const strengthFill = document.getElementById('strength-fill');

const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');

const forgotEmail = document.getElementById('forgot-email');

// ================= CONFIGURACIÓN =================
const STORAGE_KEY = 'usuarios';
const SESSION_KEY = 'sesion';      // correo del usuario con sesión iniciada
const MAX_ATTEMPTS = 3;          // intentos fallidos permitidos
const LOCK_SECONDS = 30;         // segundos de bloqueo

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)+$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_REGEX = /^09\d{8}$/;   // celular de Ecuador: 10 dígitos que empiezan con 09
const MIN_AGE = Number(regAge.min);
const MAX_AGE = Number(regAge.max);

const PASSWORD_RULES = {
    length: (v) => v.length >= 8,
    upper: (v) => /[A-ZÁÉÍÓÚÑ]/.test(v),
    lower: (v) => /[a-záéíóúñ]/.test(v),
    number: (v) => /\d/.test(v),
    special: (v) => /[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]/.test(v),
};

let failedAttempts = 0;
let lockTimer = null;

// ================= ALMACENAMIENTO (localStorage) =================
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function findUser(email) {
    return getUsers().find((user) => user.email === email);
}

// La contraseña nunca se guarda en texto plano: se guarda su hash SHA-256
async function hashPassword(password) {
    const data = new TextEncoder().encode(password);
    const buffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

// ================= NORMALIZACIÓN =================
const normalizeName = (v) => v.trim().replace(/\s+/g, ' ');
const normalizeEmail = (v) => v.trim().toLowerCase();

// ================= VALIDACIONES =================
// Cada función devuelve un mensaje de error, o '' si el valor es válido.

function validateName(value) {
    const name = normalizeName(value);
    if (!name) return 'El nombre es obligatorio';
    if (name.length < 3) return 'Debe tener al menos 3 caracteres';
    if (name.length > 50) return 'No puede superar los 50 caracteres';
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/.test(name)) return 'Solo se permiten letras y espacios';
    if (!NAME_REGEX.test(name)) return 'Ingresa nombre y apellido';
    return '';
}

function validateEmail(value, { mustBeNew = false, mustExist = false } = {}) {
    const email = normalizeEmail(value);
    if (!email) return 'El correo es obligatorio';
    if (email.length > 100) return 'El correo es demasiado largo';
    if (!EMAIL_REGEX.test(email)) return 'Formato de correo inválido (ej: usuario@correo.com)';
    if (mustBeNew && findUser(email)) return 'Este correo ya está registrado';
    if (mustExist && !findUser(email)) return 'No existe una cuenta con este correo';
    return '';
}

function validatePhone(value) {
    const phone = value.trim();
    if (!phone) return 'El teléfono es obligatorio';
    if (!/^\d+$/.test(phone)) return 'Solo se permiten números';
    if (phone.length !== 10) return 'Debe tener exactamente 10 dígitos';
    if (!PHONE_REGEX.test(phone)) return 'Debe empezar con 09';
    return '';
}

function validateAge(value) {
    // Un input number con texto inválido (ej: "1e") devuelve value = ''
    if (regAge.validity.badInput) return 'Ingresa solo números';
    if (value.trim() === '') return 'La edad es obligatoria';
    const age = Number(value);
    if (!Number.isInteger(age)) return 'La edad debe ser un número entero';
    if (age < MIN_AGE) return `Debes tener al menos ${MIN_AGE} años`;
    if (age > MAX_AGE) return `La edad máxima es ${MAX_AGE} años`;
    return '';
}

function validateCareer(value) {
    if (!value) return 'Selecciona una carrera';
    return '';
}

function validateNewPassword(value) {
    if (!value) return 'La contraseña es obligatoria';
    if (/\s/.test(value)) return 'La contraseña no puede contener espacios';
    if (value.length > 64) return 'No puede superar los 64 caracteres';
    const allValid = Object.values(PASSWORD_RULES).every((rule) => rule(value));
    if (!allValid) return 'La contraseña no cumple todos los requisitos';
    return '';
}

function validateConfirm(value) {
    if (!value) return 'Confirma tu contraseña';
    if (value !== regPassword.value) return 'Las contraseñas no coinciden';
    return '';
}

function validateLoginPassword(value) {
    if (!value) return 'La contraseña es obligatoria';
    return '';
}

// ================= MOSTRAR ESTADO EN LOS CAMPOS =================
function showFieldState(input, message) {
    const field = input.closest('.field');
    field.querySelector('.error-msg').textContent = message;
    field.classList.toggle('error', Boolean(message));
    field.classList.toggle('success', !message);
    return !message;
}

function checkField(input, validator) {
    return showFieldState(input, validator(input.value));
}

// Marca cada requisito cumplido y actualiza la barra de fuerza
const STRENGTH_COLORS = ['#ff5252', '#ff5252', '#ff8904', '#ffc503', '#ffc503', '#3ddc84'];

function updatePasswordRules(value) {
    let passed = 0;
    passRules.forEach((li) => {
        const ok = PASSWORD_RULES[li.dataset.rule](value);
        li.classList.toggle('valid', ok);
        if (ok) passed++;
    });
    strengthFill.style.width = `${(passed / passRules.length) * 100}%`;
    strengthFill.style.background = STRENGTH_COLORS[passed];
}

function resetForm(form) {
    form.reset();
    form.querySelectorAll('.field').forEach((field) => {
        field.classList.remove('error', 'success');
        field.querySelector('.error-msg').textContent = '';
    });
    form.querySelectorAll('input').forEach((input) => delete input.dataset.touched);
    // Las contraseñas vuelven a ocultarse
    form.querySelectorAll('.toggle-pass').forEach((button) => {
        button.parentElement.querySelector('input').type = 'password';
        button.querySelector('i').className = 'bx bx-show';
    });
    if (form === formRegister) updatePasswordRules('');
}

// Validación en tiempo real: al salir del campo (blur) y, una vez tocado, mientras se escribe
function liveValidate(input, validator) {
    input.addEventListener('blur', () => {
        if (!input.value && !input.dataset.touched) return;
        input.dataset.touched = 'true';
        checkField(input, validator);
    });
    input.addEventListener('input', () => {
        if (input.dataset.touched) checkField(input, validator);
    });
}

// Teléfono: se eliminan los caracteres que no sean dígitos mientras se escribe
regPhone.addEventListener('input', () => {
    regPhone.value = regPhone.value.replace(/\D/g, '').slice(0, 10);
});

// Edad: se bloquean teclas que el input number acepta pero no son válidas (e, +, -, .)
regAge.addEventListener('keydown', (e) => {
    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault();
});

liveValidate(regName, validateName);
liveValidate(regEmail, (v) => validateEmail(v, { mustBeNew: true }));
liveValidate(regPhone, validatePhone);
liveValidate(regAge, validateAge);
liveValidate(regPassword, validateNewPassword);
liveValidate(regConfirm, validateConfirm);
liveValidate(loginEmail, validateEmail);
liveValidate(loginPassword, validateLoginPassword);
liveValidate(forgotEmail, (v) => validateEmail(v, { mustExist: true }));

// El select se valida al cambiar de opción
regCareer.addEventListener('change', () => checkField(regCareer, validateCareer));

regPassword.addEventListener('input', () => {
    updatePasswordRules(regPassword.value);
    // Si cambia la contraseña, se vuelve a revisar la confirmación
    if (regConfirm.dataset.touched) checkField(regConfirm, validateConfirm);
});

// ================= MENSAJE EMERGENTE =================
let toastTimer = null;

function showToast(message, type = 'success') {
    toastText.textContent = message;
    toastIcon.className = type === 'error' ? 'bx bx-error-circle' : 'bx bx-check-circle';
    toast.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ================= REGISTRO =================
formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();

    const valid = [
        checkField(regName, validateName),
        checkField(regEmail, (v) => validateEmail(v, { mustBeNew: true })),
        checkField(regPhone, validatePhone),
        checkField(regAge, validateAge),
        checkField(regCareer, validateCareer),
        checkField(regPassword, validateNewPassword),
        checkField(regConfirm, validateConfirm),
    ].every(Boolean);

    if (!valid) {
        showToast('Revisa los campos marcados en rojo', 'error');
        return;
    }

    const users = getUsers();
    users.push({
        name: normalizeName(regName.value),
        email: normalizeEmail(regEmail.value),
        phone: regPhone.value.trim(),
        age: Number(regAge.value),
        career: regCareer.value,
        password: await hashPassword(regPassword.value),
        createdAt: new Date().toISOString(),
    });
    saveUsers(users);

    const email = normalizeEmail(regEmail.value);
    resetForm(formRegister);
    showToast('¡Cuenta creada con éxito! Ahora inicia sesión');
    showLogin();
    loginEmail.value = email;
    loginPassword.focus();
});

// ================= INICIO DE SESIÓN =================
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (lockTimer) return;

    const valid = [
        checkField(loginEmail, validateEmail),
        checkField(loginPassword, validateLoginPassword),
    ].every(Boolean);

    if (!valid) return;

    const user = findUser(normalizeEmail(loginEmail.value));
    const hash = await hashPassword(loginPassword.value);

    // Mensaje genérico: no se revela si falló el correo o la contraseña
    if (!user || user.password !== hash) {
        failedAttempts++;
        loginPassword.value = '';
        const remaining = MAX_ATTEMPTS - failedAttempts;

        if (remaining <= 0) {
            lockLogin();
        } else {
            showToast(`Correo o contraseña incorrectos. Te quedan ${remaining} intento(s)`, 'error');
        }
        return;
    }

    failedAttempts = 0;
    formLogin.querySelector('button[type="submit"]').disabled = true;
    showToast(`¡Bienvenido, ${user.name}! Inicio de sesión exitoso`);

    // Se guarda la sesión y se redirige a la página de bienvenida
    sessionStorage.setItem(SESSION_KEY, user.email);
    setTimeout(() => {
        window.location.href = 'bienvenida.html';
    }, 1200);
});

// Bloqueo temporal tras varios intentos fallidos
function lockLogin() {
    const button = formLogin.querySelector('button[type="submit"]');
    const originalContent = button.innerHTML;
    let seconds = LOCK_SECONDS;

    button.disabled = true;
    button.textContent = `Bloqueado (${seconds}s)`;
    showToast(`Demasiados intentos fallidos. Espera ${LOCK_SECONDS} segundos`, 'error');

    lockTimer = setInterval(() => {
        seconds--;
        button.textContent = `Bloqueado (${seconds}s)`;
        if (seconds <= 0) {
            clearInterval(lockTimer);
            lockTimer = null;
            failedAttempts = 0;
            button.disabled = false;
            button.innerHTML = originalContent;
        }
    }, 1000);
}

// ================= OLVIDÉ MI CONTRASEÑA =================
formForgot.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!checkField(forgotEmail, (v) => validateEmail(v, { mustExist: true }))) return;

    // Simulación: en un proyecto real el backend enviaría el correo
    showToast(`Se enviaron las instrucciones a ${normalizeEmail(forgotEmail.value)}`);
    showLogin();
});

// ================= MOSTRAR / OCULTAR CONTRASEÑA =================
document.querySelectorAll('.toggle-pass').forEach((button) => {
    button.addEventListener('click', () => {
        const input = button.parentElement.querySelector('input');
        const icon = button.querySelector('i');
        const visible = input.type === 'text';

        input.type = visible ? 'password' : 'text';
        icon.className = visible ? 'bx bx-show' : 'bx bx-hide';
        button.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
    });
});

// ================= CAMBIO ENTRE FORMULARIOS =================
const views = {
    login: formLogin,
    register: formRegister,
    forgot: formForgot,
};

const TITLES = {
    login: 'CITRA | Iniciar sesión',
    register: 'CITRA | Crear cuenta',
    forgot: 'CITRA | Recuperar contraseña',
};

function showView(name) {
    // Se limpia el formulario que se deja de ver
    const current = card.dataset.view;
    if (current !== name) resetForm(views[current]);

    Object.entries(views).forEach(([key, form]) => {
        form.classList.toggle('active', key === name);
    });

    // data-view mueve el indicador de las pestañas (ver style.css)
    card.dataset.view = name;

    // La vista "forgot" pertenece a la pestaña de inicio de sesión
    const tab = name === 'register' ? 'register' : 'login';

    document.querySelectorAll('.tab').forEach((button) => {
        const active = button.id === `tab-${tab}`;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active);
    });

    document.title = TITLES[name];
}

const showLogin = () => showView('login');

const actions = {
    'show-login': showLogin,
    'show-register': () => showView('register'),
    'show-forgot': () => showView('forgot'),
};

document.querySelectorAll('[data-action]').forEach((element) => {
    element.addEventListener('click', (e) => {
        e.preventDefault();
        actions[element.dataset.action]();
    });
});
