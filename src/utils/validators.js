// Mínimo 8 caracteres, 1 mayúscula, 1 dígito y 1 especial de: # $ % & * @
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[#$%&*@]).{8,}$/;

export const PASSWORD_MESSAGE =
    'La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 dígito y 1 carácter especial (# $ % & * @)';

export function validatePassword(password) {
    return typeof password === 'string' && PASSWORD_REGEX.test(password);
}