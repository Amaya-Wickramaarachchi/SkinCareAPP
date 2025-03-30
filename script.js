// Initialize data structure
let skincareData = {
    products: [],
    history: []
};

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('skincareData');
    if (savedData) {
        skincareData = JSON.parse(savedData);
    }
    renderProducts();
    renderHistory();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('skincareData', JSON.stringify(skincareData));
}

// Add a new product
function addProduct() {
    const productName = document.getElementById('product-name').value.trim();
    if (productName) {
        skincareData.products.push({
            id: Date.now(),
            name: productName
        });
        document.getElementById('product-name').value = '';
        saveData();
        renderProducts();
    }
}

// Render products to the DOM
function renderProducts() {
    const amList = document.getElementById('am-products');
    const pmList = document.getElementById('pm-products');
    
    amList.innerHTML = '';
    pmList.innerHTML = '';
    
    skincareData.products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <span>${product.name}</span>
            <div class="product-actions">
                <button class="am-btn" data-id="${product.id}">AM</button>
                <button class="pm-btn" data-id="${product.id}">PM</button>
            </div>
        `;
        
        // Add to both lists (for simplicity)
        amList.appendChild(productElement.cloneNode(true));
        pmList.appendChild(productElement.cloneNode(true));
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.am-btn').forEach(btn => {
        btn.addEventListener('click', () => markAsUsed(btn.dataset.id, 'am'));
    });
    
    document.querySelectorAll('.pm-btn').forEach(btn => {
        btn.addEventListener('click', () => markAsUsed(btn.dataset.id, 'pm'));
    });
}

// Mark product as used
function markAsUsed(productId, time) {
    const product = skincareData.products.find(p => p.id == productId);
    if (product) {
        const timestamp = new Date().toISOString();
        skincareData.history.push({
            productId,
            productName: product.name,
            time,
            timestamp
        });
        saveData();
        renderHistory();
    }
}

// Render history to the DOM
function renderHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    
    // Group by date
    const grouped = {};
    skincareData.history.forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(entry);
    });
    
    // Display grouped history
    for (const date in grouped) {
        const dateHeader = document.createElement('h3');
        dateHeader.textContent = date;
        historyList.appendChild(dateHeader);
        
        grouped[date].forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = 'history-item';
            entryElement.textContent = `${entry.time.toUpperCase()}: ${entry.productName}`;
            historyList.appendChild(entryElement);
        });
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    document.getElementById('add-product').addEventListener('click', addProduct);
    
    document.getElementById('product-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addProduct();
    });
});
