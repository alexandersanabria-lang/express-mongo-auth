const Utils = {
    // Escapa texto para pintarlo de forma segura con innerHTML
    esc(value) {
        return String(value ?? '').replace(/[&<>"']/g, (c) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c]));
    },

    // La fecha de nacimiento se guarda a medianoche UTC; sin timeZone UTC se mostraría un día antes en Perú
    formatDate(value) {
        if (!value) return '';
        return new Date(value).toLocaleDateString('es-PE', {
            timeZone: 'UTC',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    },

    formatDateTime(value) {
        if (!value) return '';
        return new Date(value).toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Lista con los datos de un usuario (la usan el dashboard y el modal del admin)
    userDetailsHtml(user) {
        const rows = [
            ['person', 'Nombre', `${user.name || ''} ${user.lastName || ''}`.trim()],
            ['email', 'Email', user.email],
            ['phone', 'Teléfono', user.phoneNumber],
            ['cake', 'Nacimiento', user.birthdate ? `${Utils.formatDate(user.birthdate)} (${user.age} años)` : ''],
            ['home', 'Dirección', user.address],
            ['security', 'Rol', (user.roles || []).join(', ')],
            ['event', 'Registrado', Utils.formatDateTime(user.createdAt)]
        ];

        return '<ul class="collection">' + rows.map(([icon, label, value]) =>
            `<li class="collection-item"><i class="material-icons teal-text left">${icon}</i><strong>${label}:</strong> ${Utils.esc(value || '—')}</li>`
        ).join('') + '</ul>';
    }
};