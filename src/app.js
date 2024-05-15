import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import config from './config.js';
import productsRouter from './routes/products.routes.js';
import usersRouter from './routes/users.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' })); // Se aceptan solicitudes desde CUALQUIER origen

app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);

app.listen(config.PORT, async () => {
    await mongoose.connect(config.MONGODB_URL);
    console.log(`APP activa puerto ${config.PORT} y conectada a ${config.MONGODB_URL}`);
});
