require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require('path')

// === IMPORTS DE MODÈLES ===
const Product = require('./models/Product')
const User = require('./models/User')
const Cart = require('./models/Cart')

// === MIDDLEWARE ===
app.use(express.json())
app.use(express.static('publics'))

// === ROUTES STATIQUES ===
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'publics', '6reezy.html'))
})

// === CONNEXION MONGODB ===
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('DB connectée ✅'))
  .catch(err => console.log(err))

const PORT = process.env.PORT || 3000

// ========== ROUTES API - PRODUITS ==========

// Récupérer tous les produits
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur : ' + err.message })
  }
})

// Ajouter un produit
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: 'Erreur : ' + err.message })
  }
})

// Supprimer un produit
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: 'Produit supprimé ✅' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ========== ROUTES API - UTILISATEURS ==========

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const SECRET = process.env.SECRET

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, nom, prenom } = req.body
    const hash = await bcrypt.hash(password, 10)
    const user = new User({ email, password: hash, nom, prenom })
    await user.save()
    res.json({ message: 'Compte créé ✅' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Utilisateur introuvable' })
    
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json({ message: 'Mot de passe incorrect' })
    
    const token = jwt.sign({ id: user._id }, SECRET)
    res.json({ token, userId: user._id })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ========== ROUTES API - PANIER ==========

// Obtenir le panier d'un utilisateur
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId })
    if (!cart) return res.status(404).json({ message: 'Panier introuvable ou vide' })
    res.json(cart)
  } catch (err) {
    console.error('Erreur lors de la récupération du panier :', err)
    res.status(500).json({ message: err.message })
  }
})

// Ajouter au panier
app.post('/api/cart', async (req, res) => {
  try {
    const { userId, productId, taille, quantite } = req.body
    let cart = await Cart.findOne({ userId })
    
    if (!cart) {
      cart = new Cart({ userId, products: [] })
    }
    
    cart.products.push({ productId, taille, quantite })
    await cart.save()
    res.json(cart)
  } catch (err) {
    console.error('Erreur lors de l\'ajout au panier :', err)
    res.status(500).json({ message: err.message })
  }
})

// Supprimer du panier
app.delete('/api/cart/:userId/:itemId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId })
    if (!cart) return res.status(404).json({ message: 'Panier introuvable' })
    
    // Filtre par l'ID unique de la ligne du produit
    cart.products = cart.products.filter(p => p._id.toString() !== req.params.itemId)
    await cart.save()
    res.json(cart)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ========== ROUTES API - PAIEMENT ==========

const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ton-email@gmail.com',
    pass: 'ton-mot-de-passe-app'
  }
})

// Paiement
app.post('/api/payment', async (req, res) => {
  try {
    const { montant, email } = req.body
    
    // Appel à FedaPay ou autre service de paiement ici
    
    res.json({ message: 'Paiement traité ✅' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

// Email confirmation
app.post('/api/email', async (req, res) => {
  try {
    const { email, nom } = req.body
    
    await transporter.sendMail({
      from: 'ton-email@gmail.com',
      to: email,
      subject: '6reeZy - Confirmation de commande 🎉',
      html: `
        <h1>Merci ${nom} !</h1>
        <p>Ta commande 6reeZy a bien été reçue.</p>
        <p>On tient au courant de l'expédition.</p>
        <hr>
        <p>6reeZy Studios 🎨</p>
      `
    })
    
    res.json({ message: 'Email envoyé ✅' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ========== DÉMARRAGE DU SERVEUR ========== 
// ⚠️ APRÈS TOUTES LES ROUTES ⚠️

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT} 🚀`)
})