const Auth = (() => {
    const TOKEN_KEY = 'token';

    const getToken = () => sessionStorage.getItem(TOKEN_KEY);
    const saveToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
    const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

    // Lee el contenido (payload) del JWT sin verificarlo: la verificación real la hace el servidor
    function decode(token) {
        try {
            const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const json = decodeURIComponent(
                atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
            );
            return JSON.parse(json);
        } catch {
            return null;
        }
    }

    // Devuelve la sesión si el token existe y no ha vencido; si venció, lo borra
    function getSession() {
        const token = getToken();
        if (!token) return null;

        const payload = decode(token);
        if (!payload || !payload.exp || payload.exp * 1000 <= Date.now()) {
            clearToken();
            return null;
        }
        return { token, userId: payload.sub, roles: payload.roles || [], exp: payload.exp };
    }

    function logout() {
        clearToken();
        window.location.href = '/signIn';
    }

    // Protege una página: sin sesión => /signIn, sin rol suficiente => /403
    function requireAuth(allowedRoles = []) {
        const session = getSession();
        if (!session) {
            logout();
            return null;
        }
        if (allowedRoles.length > 0 && !session.roles.some(r => allowedRoles.includes(r))) {
            window.location.href = '/403';
            return null;
        }
        return session;
    }

    // Fetch que agrega el token y maneja 401 (sesión vencida) y 403 (sin permiso)
    async function apiFetch(url, options = {}) {
        const session = getSession();
        if (!session) {
            logout();
            throw new Error('Sesión expirada');
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.token}`,
                ...(options.headers || {})
            }
        });

        if (response.status === 401) {
            logout();
            throw new Error('Sesión expirada');
        }
        if (response.status === 403) {
            window.location.href = '/403';
            throw new Error('Acceso denegado');
        }

        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Error en la petición');
        return data;
    }

    // A qué dashboard va cada rol
    function homeFor(roles) {
        return roles.includes('admin') ? '/admin' : '/dashboard';
    }

    // Muestra u oculta los enlaces del menú según la sesión
    function setupNavbar() {
        const session = getSession();

        document.querySelectorAll('.guest-only').forEach(el => {
            el.style.display = session ? 'none' : '';
        });
        document.querySelectorAll('.auth-only').forEach(el => {
            el.style.display = session ? '' : 'none';
        });
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = session && session.roles.includes('admin') ? '' : 'none';
        });

        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }

        // Cierra la sesión automáticamente cuando el token se venza
        if (session) {
            const msLeft = session.exp * 1000 - Date.now();
            setTimeout(() => {
                M.toast({ html: 'Tu sesión expiró', classes: 'red' });
                setTimeout(logout, 1500);
            }, msLeft);
        }
    }

    document.addEventListener('DOMContentLoaded', setupNavbar);

    return { getToken, saveToken, getSession, logout, requireAuth, apiFetch, homeFor };
})();