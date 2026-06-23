const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    nom: String,
    prenom: String,
    adresse: String
})

module.exports = mongoose.model('User', userSchema)