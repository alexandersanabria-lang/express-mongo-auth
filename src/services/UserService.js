import userRepository from '../repositories/UserRepository.js';

// Campos que el usuario puede editar de su propio perfil
const EDITABLE_FIELDS = ['name', 'lastName', 'phoneNumber', 'birthdate', 'url_profile', 'address'];

function toProfile(user) {
    return {
        id: user._id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        birthdate: user.birthdate,
        age: user.age,
        url_profile: user.url_profile,
        address: user.address,
        roles: user.roles.map(r => r.name),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
}

class UserService {
    async getAll() {
        const users = await userRepository.getAll();
        return users.map(toProfile);
    }

    async getById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            const err = new Error('Usuario no encontrado');
            err.status = 404;
            throw err;
        }
        return toProfile(user);
    }

    async updateMe(id, data) {
        // Solo se copian los campos permitidos (no email, password ni roles)
        const changes = {};
        for (const field of EDITABLE_FIELDS) {
            if (data[field] !== undefined) changes[field] = data[field];
        }

        const user = await userRepository.updateById(id, changes);
        if (!user) {
            const err = new Error('Usuario no encontrado');
            err.status = 404;
            throw err;
        }
        return toProfile(user);
    }
}

export default new UserService();