async function chargerProduits() {
    const res = await fetch('/api/products')
    const produits = await res.json()
    
    const grid = document.getElementById('grid')
    grid.innerHTML = ''
    
    produits.forEach(produit => {
        const id = produit._id  // ← C'EST IMPORTANT
        grid.innerHTML += `
            <div class="product-card">
                <div class="product-img-placeholder">
                    <img src="${produit.image}" alt="${produit.nom}">
                </div>
                <span class="drop-badge">${produit.drop}</span>
                <div class="product-info">
                    <div class="product-name">${produit.nom}</div>
                    <div class="product-bottom">
                        <span class="product-price">${produit.prix} FCFA</span>
                        <select id="taille-${id}" style="margin: 10px 0; padding: 8px; width: 100%;">
                            <option value="">Choisir taille</option>
                            ${produit.tailles.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                        ${produit.stock > 0 
                            ? `<button onclick="ajouterAvecTaille('${id}')">Acheter</button>`
                            : `<button disabled>Épuisé</button>`
                        }
                    </div>
                </div>
            </div>
        `
    })
}

function ajouterAvecTaille(productId) {
    const taille = document.getElementById(`taille-${productId}`).value
    if (!taille) {
        alert('Choisis une taille !')
        return
    }
    ajouterAuPanier(productId, taille)
}
chargerProduits()
