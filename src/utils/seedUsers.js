import bcrypt from 'bcrypt';
import userRepository from '../repositories/UserRepository.js';
import roleRepository from '../repositories/RoleRepository.js';

export default async function seedUsers() {
    const email = (process.env.ADMIN_EMAIL || 'admin@admin.com').toLowerCase();

    // Si el admin ya existe, no hacer nada (así no se duplica al reiniciar)
    const existing = await userRepository.findByEmail(email);
    if (existing) return;

    const password = process.env.ADMIN_PASSWORD || 'Admin123#';
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);
    const hashed = await bcrypt.hash(password, saltRounds);

    const adminRole = await roleRepository.findByName('admin');

    await userRepository.create({
        email,
        password: hashed,
        name: 'Admin',
        lastName: 'Sistema',
        phoneNumber: '999999999',
        birthdate: new Date('1990-01-01'),
        address: 'Oficina central',
        roles: [adminRole._id]
    });

    console.log(`Seeded admin: ${email}`);
}