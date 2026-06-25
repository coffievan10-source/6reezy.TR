const express = require('express')
const mongoose = require('mongoose')
const app = express()
app.use(express.json())
app.use(express.static('publics'))

mongoose.connect('mongodb+srv://coffievan10_db_user:A4WMPhQ32CJIFC8i@cluster0.qcbwhrf.mongodb.net/6reezy')
.then(() => console.log('DB connectée ✅'))
.catch(err => console.log(err))

app.listen(3000, () => {
    console.log('Serveur lancé port 3000 ✅')
})
const Product = require('./models/Product')

// Obtenir tous les produits
app.get('/api/products', async (req, res) => {
    const products = await Product.find()
    res.json(products)
})

// Ajouter un produit
app.post('/api/products', async (req, res) => {
    const product = new Product(req.body)
    await product.save()
    res.json(product)
})

// Supprimer un produit
app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: 'Produit supprimé' })
})
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('./models/User')

const SECRET = '6reezy_secret_key'

// Register
app.post('/api/register', async (req, res) => {
    const { email, password, nom, prenom } = req.body
    const hash = await bcrypt.hash(password, 10)
    const user = new User({ email, password: hash, nom, prenom })
    await user.save()
    res.json({ message: 'Compte créé ✅' })
})

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Utilisateur introuvable' })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json({ message: 'Mot de passe incorrect' })
    const token = jwt.sign({ id: user._id }, SECRET)
    res.json({ token, userId: user._id })
})
const Cart = require('./models/Cart')

// Obtenir le panier d'un utilisateur avec les détails des produits
app.get('/api/cart/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId })
             // 👈 C'est CETTE ligne qui va lier l'ID aux vraies infos (nom, prix)

        if (!cart) {
            return res.status(404).json({ message: "Panier introuvable ou vide" });
        }
        res.json(cart);
    } catch (error) {
        console.error("Erreur lors de la récupération du panier :", error);
        res.status(500).json({ error: error.message });
    }
});

// Ajouter au panier
app.post('/api/cart', async (req, res) => {
    try {
        const { userId, productId, taille, quantite } = req.body
        let cart = await Cart.findOne({ userId })
        if (!cart) {
            cart = new Cart({ userId, produits: [] })
        }
        cart.produits.push({ productId, taille, quantite })
        await cart.save()
        res.json(cart)
    } catch(err) {
        console.error("Erreur lors de l'ajout au panier :", err )
        res.status(500).json({ message: err.message })
    }
})

// Supprimer du panier
app.delete('/api/cart/:userId/:itemId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId })
        if (!cart) return res.status(404).json({ message: "Panier introuvable" })

        // On filtre par l'ID unique de la ligne de produit
        cart.produits = cart.produits.filter(p => p._id.toString() !== req.params.itemId)

        await cart.save()
        res.json(cart)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

app.post('/api/payment', async (req, res) => {
  try {
    const { montant, email } = req.body
    
    const transaction = await FedaPay.Transaction.create({
      description: '6ReeZY Order',
      amount: montant,
      currency: { iso: 'XOF' },
      callback_url: 'http://localhost:3000/success.html',
      customer: { email: email }
    })

    const token = await transaction.generateToken()
    res.json({ url: token.token.token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ton-email@gmail.com',
        pass: 'ton-mot-de-passe-app'
    }
})

// Envoyer email confirmation commande
app.post('/api/email', async (req, res) => {
    const { email, nom } = req.body
    
    await transporter.sendMail({
        from: 'ton-email@gmail.com',
        to: email,
        subject: '6ReeZY - Confirmation de commande 🔥',
        html: `
            <h1>Merci ${nom} !</h1>
            <p>Ta commande 6ReeZY a bien été reçue.</p>
            <p>On te tient au courant de l'expédition.</p>
            <br>
            <p>6ReeZY Studios 🔥</p>
        `
    })
    
    res.json({ message: 'Email envoyé ✅' })
})
