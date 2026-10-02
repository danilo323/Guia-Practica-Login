// ================= PÁGINA DE BIENVENIDA =================
// Si no hay sesión iniciada, se regresa al login
if (!sessionStorage.getItem('sesion')) {
    window.location.replace('index.html');
}
