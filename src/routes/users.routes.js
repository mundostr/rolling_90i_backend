import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import config from '../config.js';
import userModel from '../models/users.model.js';

const router = Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const existentUser = await userModel.findOne({ email: email });
        if (!existentUser) return res.status(401).send({ server: config.SERVER, data: `No existe el usuario` });
        
        const passwordMatch = await bcrypt.compare(password, existentUser.password);
        if (!passwordMatch) return res.status(403).send({ server: config.SERVER, data: `Clave no válida` });

        const token = jwt.sign({ id: existentUser._id, nombre: existentUser.nombre, email: existentUser.email, role: existentUser.role }, config.SECRET, { expiresIn: '1h' });
        res.status(200).send({ server: config.SERVER, data: { status: 'Usuario identificado correctamente', token: token } });
    } catch (err) {
        res.status(500).send({ server: config.SERVER, data: `ERROR al recuperar productos (código 23)` });
    }
});

export default router;
