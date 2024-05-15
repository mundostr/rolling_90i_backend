import { Router } from 'express';
import jwt from 'jsonwebtoken';

import config from '../config.js';
import productModel from '../models/products.model.js';

const router = Router();
const mongoDBIdRegex = /^[0-9a-fA-F]{24}$/;

const acceptedFields = [
    { name: 'codigo', type: 'number' },
    { name: 'tipo', type: 'string' },
    { name: 'nombre', type: 'string' },
    { name: 'precio', type: 'number' },
    { name: 'stock', type: 'number' },
    { name: 'imagen', type: 'string' }
];
const requiredFields = [
    { name: 'codigo', type: 'number' },
    { name: 'nombre', type: 'string' },
    { name: 'precio', type: 'number' },
    { name: 'stock', type: 'number' }
];

const validateId = (req, res, next) => {
    if (!mongoDBIdRegex.test(req.params.id)) return res.status(400).send({ server: config.SERVER, data: 'Formato de ID no válido' });
    
    next();
};

const extractFields = (req, res, next) => {
    req.extractedBody = {};
    acceptedFields.forEach(field => {
        if (req.body.hasOwnProperty(field.name) && typeof(req.body[field.name]) === field.type) {
            req.extractedBody[field.name] = req.body[field.name];
        }
    });
    
    next();
}

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.status(401).send({ server: config.SERVER, data: `Se requiere token` });
    
    jwt.verify(token, config.SECRET, (err, user) => {
        if (err) return res.status(403).send({ server: config.SERVER, data: `Token no válido` });
        req.user = user;
        
        next();
    });
}

const verifyRol = (requiredRoles) => {
    return (req, res, next) => {
        if (!requiredRoles.includes(req.user.role))
            return res.status(403).send({ server: config.SERVER, data: `Permisos insuficientes` });
        
        next();
    };
}

// El endpoint GET queda "abierto"
router.get('/', async (req, res) => {
    try {
        // const products = await productModel.find({}, '-codigo -imagen').lean();
        const products = await productModel.find({}).lean();
        res.status(200).send({ server: config.SERVER, data: products });
    } catch (err) {
        res.status(500).send({ server: config.SERVER, data: `ERROR al recuperar productos (código 23)` });
    }
});

/**
 * El endpoint POST utiliza 2 middlewares,
 * uno para verificar que en la solicitud venga un token válido (esto quiere decir
 * que el usuario hizo el login correctamente);
 * el otro para verificar el rol, solo si es admin o premium podrá cargar
 * nuevos productos.
 */
router.post('/', verifyToken, verifyRol(['admin', 'premium']), async (req, res) => {
    try {
        let fieldsOk = requiredFields.every(field => req.body.hasOwnProperty(field.name) && typeof(req.body[field.name]) === field.type);
        if (!fieldsOk) return res.status(400).send({ server: config.SERVER, data: `Faltan campos obligatorios o no coinciden formatos (codigo, nombre, precio, stock)` });

        const { codigo, nombre, precio, stock, tipo, imagen } = req.body;

        const process = await productModel.create({ codigo, nombre, precio, stock, tipo, imagen });
        res.status(200).send({ server: config.SERVER, data: process });
    } catch (err) {
        res.status(500).send({ server: config.SERVER, data: `ERROR al cargar nuevo producto (código 21)` });
    }
});

/**
 * Similar situación para el PUT y el DELETE: solo si es admin podrá continuar
 */
router.put('/:id', verifyToken, verifyRol(['admin']), validateId, extractFields, async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        const update = req.extractedBody; // Esto llega desde extractFields
        const options = { new: true };    
        const process = await productModel.findOneAndUpdate(filter, update, options);
        
        res.status(200).send({ server: config.SERVER, data: process });

    } catch (err) {
        res.status(500).send({ server: config.SERVER, data: `ERROR al modificar producto (código 20)` });
    }
});

router.delete('/:id', verifyToken, verifyRol(['admin']), validateId, async (req, res) => {
    try {
        if (mongoDBIdRegex.test(req.params.id)) {
            const filter = { _id: req.params.id };
            const process = await productModel.findOneAndDelete(filter);
            res.send({ server: config.SERVER, data: process });
        } else {
            res.status(400).send({ server: config.SERVER, data: 'Formato de ID no válido' });
        }
    } catch (err) {
        res.status(500).send({ server: config.SERVER, data: `ERROR al modificar producto (código 20)` });
    }
});

export default router;
