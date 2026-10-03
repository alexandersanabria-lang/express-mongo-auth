import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import viewRoutes from './routes/views.routes.js';
import seedRoles from './utils/seedRoles.js';
import seedUsers from './utils/seedUsers.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Habilitar CORS para todos
app.use(cors());
app.use(express.json());

// Archivos estáticos (css, js del navegador)
app.use(express.static(path.join(__dirname, 'public')));

// API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Validar estado del servidor
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

// Páginas
app.use('/', viewRoutes);

// 404: rutas de la API responden JSON, el resto muestra la página 404
app.use('/api', (req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});
app.use((req, res) => {
    res.status(404).render('404', { title: 'No encontrada' });
});

// Manejador global de errores
app.use((err, req, res, next) => {
    // Errores de validación de Mongoose => 400
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(e => e.message).join('. ');
        return res.status(400).json({ message });
    }
    // ID con formato inválido => 400
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Dato con formato inválido' });
    }
    // Valor duplicado (por ejemplo, email repetido) => 400
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Ya existe un registro con ese valor' });
    }

    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, { autoIndex: true })
    .then(async () => {
        console.log('Mongo connected');
        await seedRoles();
        await seedUsers();
        app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
    })
    .catch(err => {
        console.error('Error al conectar con Mongo:', err);
        process.exit(1);
    });