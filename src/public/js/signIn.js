document.addEventListener('DOMContentLoaded', () => {
    // Si ya hay una sesión válida, ir directo a su dashboard
    const existing = Auth.getSession();
    if (existing) {
        window.location.href = Auth.homeFor(existing.roles);
        return;
    }

    // Aviso después de registrarse
    if (new URLSearchParams(window.location.search).get('registered')) {
        M.toast({ html: 'Registro exitoso. Ahora inicia sesión.', classes: 'green' });
    }

    const form = document.getElementById('signin-form');
    const errorBox = document.getElementById('form-error');
    const submitBtn = document.getElementById('btn-submit');

    function showError(message) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showError('Ingresa tu email y contraseña');
            return;
        }

        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/auth/signIn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'No se pudo iniciar sesión');

            // Guardar el token y redirigir según el rol
            Auth.saveToken(data.token);
            window.location.href = Auth.homeFor(data.roles);
        } catch (err) {
            showError(err.message);
            submitBtn.disabled = false;
        }
    });
});