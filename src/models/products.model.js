import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'products';

const schema = new mongoose.Schema({
    codigo: { type: Number, required: true },
    tipo: { type: String, enum: ['standard', 'premium', 'special'], default: 'standard' },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true },
    imagen: { type: String, required: false }
});

const productModel = mongoose.model(collection, schema);

export default productModel;
