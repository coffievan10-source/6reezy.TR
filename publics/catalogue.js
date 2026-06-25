async function chargerProduits() {
  const res = await fetch('/api/products')
  const produits = await res.json()

  const grid = document.getElementById('grid')
  // NE PAS effacer le HTML existant (sold out)

  produits.forEach(produit => {
    const id = produit._id
    const card = document.createElement('div')
    card.className ="product-card"
    card.dataset.drop ="drop003"
    card.dataset.sold ="false"
    card.style.cursor = 'pointer'
    card.innerHTML = `
      <div class="product-img-placeholder">
        <img src="${produit.image}" alt="${produit.nom}">
      </div>
      <span class="drop-badge">${produit.drop}</span>
      <div class="product-info">
        <div class="product-name">${produit.nom}</div>
        <div class="product-bottom">
          <span class="product-price">${produit.prix} FCFA</span>
        </div>
      </div>
    `
    card.addEventListener('click', () => {
      window.location.href = `product.html?name=${encodeURIComponent(produit.nom)}`
    })
    grid.appendChild(card)
  })
}

chargerProduits()