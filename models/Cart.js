const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
  userId: String,
  produits: [{
    productId: String,
    taille: String,
    quantite: Number
  }]
})

module.exports = mongoose.model('Cart', cartSchema)