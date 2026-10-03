document.addEventListener('DOMContentLoaded', () => {
    // Si ya hay sesión, no tiene sentido registrarse
    const existing = Auth.getSession();
    if (existing) {
        window.location.href = Auth.homeFor(existing.roles);
        return;
    }

    // Misma regla que el servidor: 8+ caracteres, 1 mayúscula, 1 dígito, 1 especial (# $ % & * @)
    const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[#$%&*@]).{8,}$/;

    const form = document.getElementById('signup-form');
    const errorBox = document.getElementById('form-error');
    const submitBtn = document.getElementById('btn-submit');

    // No permitir fechas futuras en el calendario
    document.getElementById('birthdate').max = new Date().toISOString().split('T')[0];

    function showError(message) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';

        const payload = {
            name: document.getElementById('name').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            phoneNumber: document.getElementById('phoneNumber').value.trim(),
            birthdate: document.getElementById('birthdate').value,
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value
        };

        // Validaciones en el navegador (el servidor las vuelve a validar)
        if (Object.values(payload).some(value => !value)) {
            showError('Completa todos los campos');
            return;
        }
        if (!PASSWORD_REGEX.test(payload.password)) {
            showError('La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 dígito y 1 carácter especial (# $ % & * @)');
            return;
        }

        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/auth/signUp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'No se pudo completar el registro');

            // Registro correcto => ir a SignIn
            window.location.href = '/signIn?registered=1';
        } catch (err) {
            showError(err.message);
            submitBtn.disabled = false;
        }
    });
});