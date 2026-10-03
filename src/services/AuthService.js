import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/UserRepository.js';
import roleRepository from '../repositories/RoleRepository.js';
import { validatePassword, PASSWORD_MESSAGE } from '../utils/validators.js';

class AuthService {
    async signUp({ email, password, name, lastName, phoneNumber, birthdate, url_profile, address }) {
        const existing = await userRepository.findByEmail(email);
        if (existing) {
            const err = new Error('El email ya se encuentra en uso');
            err.status = 400;
            throw err;
        }

        // Validar la contraseña ANTES de encriptarla
        if (!validatePassword(password)) {
            const err = new Error(PASSWORD_MESSAGE);
            err.status = 400;
            throw err;
        }

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);
        const hashed = await bcrypt.hash(password, saltRounds);

        // El registro público SIEMPRE asigna el rol "user"
        let roleDoc = await roleRepository.findByName('user');
        if (!roleDoc) roleDoc = await roleRepository.create({ name: 'user' });

        const user = await userRepository.create({
            email,
            password: hashed,
            name,
            lastName,
            phoneNumber,
            birthdate,
            url_profile,
            address,
            roles: [roleDoc._id]
        });

        return {
            id: user._id,
            email: user.email,
            name: user.name,
            lastName: user.lastName
        };
    }

    async signIn({ email, password }) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            const err = new Error('Credenciales inválidas');
            err.status = 401;
            throw err;
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            const err = new Error('Credenciales inválidas');
            err.status = 401;
            throw err;
        }

        const roles = user.roles.map(r => r.name);

        const token = jwt.sign(
            {
                sub: user._id,
                roles
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '1h'
            }
        );

        return { token, roles };
    }
}

export default new AuthService();