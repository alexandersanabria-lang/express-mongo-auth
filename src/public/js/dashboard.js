document.addEventListener('DOMContentLoaded', async () => {
    // Solo usuarios logueados con rol user (o superior)
    const session = Auth.requireAuth(['user', 'admin']);
    if (!session) return;

    try {
        const user = await Auth.apiFetch('/api/users/me');

        document.getElementById('welcome-name').textContent = `${user.name} ${user.lastName}`;
        document.getElementById('user-details').innerHTML = Utils.userDetailsHtml(user);

        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    } catch (err) {
        M.toast({ html: Utils.esc(err.message), classes: 'red' });
    }
});