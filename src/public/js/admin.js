document.addEventListener('DOMContentLoaded', async () => {
    // Solo accesible para el rol admin
    const session = Auth.requireAuth(['admin']);
    if (!session) return;

    const modal = M.Modal.init(document.getElementById('user-modal'));
    const tbody = document.getElementById('users-body');

    try {
        const users = await Auth.apiFetch('/api/users');

        document.getElementById('total').textContent = users.length;

        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${Utils.esc(u.name)} ${Utils.esc(u.lastName)}</td>
                <td>${Utils.esc(u.email)}</td>
                <td>${u.roles.map(r => `<span class="chip ${r === 'admin' ? 'teal white-text' : ''}">${Utils.esc(r)}</span>`).join('')}</td>
                <td>${Utils.esc(u.age ?? '—')}</td>
                <td>${Utils.esc(Utils.formatDateTime(u.createdAt))}</td>
                <td>
                    <button class="btn-small teal btn-view" data-id="${Utils.esc(u.id)}" title="Ver información">
                        <i class="material-icons">visibility</i>
                    </button>
                </td>
            </tr>
        `).join('');

        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    } catch (err) {
        M.toast({ html: Utils.esc(err.message), classes: 'red' });
        return;
    }

    // Botón "ver": consulta GET /api/users/:id y muestra el detalle en el modal
    tbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-view');
        if (!btn) return;

        try {
            const user = await Auth.apiFetch(`/api/users/${btn.dataset.id}`);
            document.getElementById('modal-body').innerHTML = Utils.userDetailsHtml(user);
            modal.open();
        } catch (err) {
            M.toast({ html: Utils.esc(err.message), classes: 'red' });
        }
    });
});