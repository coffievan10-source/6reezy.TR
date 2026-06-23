const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    nom: String,
    prix: Number,
    description: String,
    image: String,
    tailles: [String],
    stock: Number,
    drop: String
})

module.exports = mongoose.model('Product', productSchema)