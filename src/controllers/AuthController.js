import authService from '../services/AuthService.js';

class AuthController {
    async signUp(req, res, next) {
        try {
            const { email, password, name, lastName, phoneNumber, birthdate, url_profile, address } = req.body;

            if (!email || !password || !name || !lastName || !phoneNumber || !birthdate)
                return res.status(400).json({
                    message: 'Los campos name, lastName, phoneNumber, birthdate, email y password son requeridos'
                });

            const user = await authService.signUp({
                email, password, name, lastName, phoneNumber, birthdate, url_profile, address
            });
            return res.status(201).json(user);
        } catch (err) {
            next(err);
        }
    }

    async signIn(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password)
                return res.status(400).json({ message: 'El email y password son requeridos' });

            const result = await authService.signIn({ email, password });
            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
}

export default new AuthController();