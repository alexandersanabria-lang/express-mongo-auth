import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/signIn');
});

router.get('/signIn', (req, res) => {
    res.render('signIn', { title: 'Iniciar sesión', script: 'signIn.js' });
});

router.get('/signUp', (req, res) => {
    res.render('signUp', { title: 'Registro', script: 'signUp.js' });
});

router.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Dashboard', script: 'dashboard.js' });
});

router.get('/profile', (req, res) => {
    res.render('profile', { title: 'Mi cuenta', script: 'profile.js' });
});

router.get('/admin', (req, res) => {
    res.render('admin', { title: 'Administración', script: 'admin.js' });
});

router.get('/403', (req, res) => {
    res.status(403).render('403', { title: 'Acceso denegado' });
});

export default router;