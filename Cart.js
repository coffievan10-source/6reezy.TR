async function ajouterAuPanier(productId, taille) {
    const userId = localStorage.getItem('userId')
    if (!userId) {
        window.location.href = '/login.html'
        return
    }
    const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, taille, quantite: 1 })
    })
    const data = await res.json()
    alert('Produit ajouté au panier ✅')
}
