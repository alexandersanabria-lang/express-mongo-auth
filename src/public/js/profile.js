document.addEventListener('DOMContentLoaded', async () => {
    const session = Auth.requireAuth(['user', 'admin']);
    if (!session) return;

    const $ = (id) => document.getElementById(id);
    const form = $('profile-form');
    const errorBox = $('form-error');
    const submitBtn = $('btn-submit');
    const photo = $('photo');
    const photoDefault = $('photo-default');

    // No permitir fechas futuras
    $('birthdate').max = new Date().toISOString().split('T')[0];

    function showError(message) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
    }

    // Muestra la foto solo si la URL es http(s); si falla la carga, vuelve al avatar por defecto
    function showPhoto(url) {
        const valid = /^https?:\/\//i.test(url || '');
        photo.style.display = valid ? '' : 'none';
        photoDefault.style.display = valid ? 'none' : '';
        if (valid) photo.src = url;
    }
    photo.addEventListener('error', () => showPhoto(''));

    function fillForm(user) {
        $('name').value = user.name || '';
        $('lastName').value = user.lastName || '';
        $('email').value = user.email || '';
        $('phoneNumber').value = user.phoneNumber || '';
        $('birthdate').value = user.birthdate ? user.birthdate.slice(0, 10) : '';
        $('address').value = user.address || '';
        $('url_profile').value = user.url_profile || '';

        $('info-roles').textContent = (user.roles || []).join(', ');
        $('info-age').textContent = user.age ?? '—';

        showPhoto(user.url_profile);
        M.updateTextFields(); // acomoda las etiquetas de Materialize sobre los valores
    }

    // Cargar los datos actuales
    try {
        const user = await Auth.apiFetch('/api/users/me');
        fillForm(user);
        $('loading').style.display = 'none';
        $('content').style.display = 'flex';
    } catch (err) {
        M.toast({ html: Utils.esc(err.message), classes: 'red' });
        return;
    }

    // Guardar cambios
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';

        const payload = {
            name: $('name').value.trim(),
            lastName: $('lastName').value.trim(),
            phoneNumber: $('phoneNumber').value.trim(),
            birthdate: $('birthdate').value,
            address: $('address').value.trim(),
            url_profile: $('url_profile').value.trim()
        };

        if (!payload.name || !payload.lastName || !payload.phoneNumber || !payload.birthdate) {
            showError('Nombre, apellido, teléfono y fecha de nacimiento son obligatorios');
            return;
        }

        submitBtn.disabled = true;

        try {
            const updated = await Auth.apiFetch('/api/users/me', {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            fillForm(updated);
            M.toast({ html: 'Perfil actualizado', classes: 'green' });
        } catch (err) {
            showError(err.message);
        } finally {
            submitBtn.disabled = false;
        }
    });
});