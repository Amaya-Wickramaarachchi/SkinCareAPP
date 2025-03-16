// Update at the top of app.js
// Replace with your actual Supabase URL and anon key from your project settings
const SUPABASE_URL = 'https://rgdftwpfyzqxsqoszped.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZGZ0d3BmeXpxeHNxb3N6cGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNDQ3OTAsImV4cCI6MjA1NzcyMDc5MH0.MkE9Xwu9cODqsFEgIyoYPF4YTjU_Pp17vsY63Va5p3o';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Add authentication functions
async function signUp(email, password) {
    try {
        const { user, error } = await supabase.auth.signUp({
            email,
            password,
        });
        
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Error signing up:', error.message);
        throw error;
    }
}

async function signIn(email, password) {
    try {
        const { user, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) throw error;
        currentUser = user;
        return user;
    } catch (error) {
        console.error('Error signing in:', error.message);
        throw error;
    }
}

async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        currentUser = null;
    } catch (error) {
        console.error('Error signing out:', error.message);
        throw error;
    }
}

// Update your CRUD operations to use Supabase
async function fetchProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        products = data;
        renderProducts();
        renderDashboard();
    } catch (error) {
        console.error('Error fetching products:', error.message);
        // Fall back to local storage
        loadFromLocalStorage();
    }
}

async function addProductToSupabase(product) {
    try {
        const { data, error } = await supabase
            .from('products')
            .insert([
                {
                    name: product.name,
                    brand: product.brand,
                    category: product.category,
                    purchase_date: product.purchaseDate,
                    notes: product.notes
                }
            ])
            .select();
        
        if (error) throw error;
        
        // Update local state with the returned data
        products.push(data[0]);
        renderProducts();
        renderDashboard();
        return data[0];
    } catch (error) {
        console.error('Error adding product:', error.message);
       // Fall back to local storage
       products.push(product);
       saveToLocalStorage();
       renderProducts();
       renderDashboard();
       return product;
   }
}

async function updateProductInSupabase(productId, updates) {
   try {
       const { data, error } = await supabase
           .from('products')
           .update(updates)
           .eq('id', productId)
           .select();
       
       if (error) throw error;
       
       // Update local state
       const index = products.findIndex(p => p.id === productId);
       if (index !== -1) {
           products[index] = { ...products[index], ...updates };
       }
       
       renderProducts();
       renderDashboard();
       return data[0];
   } catch (error) {
       console.error('Error updating product:', error.message);
       // Fall back to local update
       const index = products.findIndex(p => p.id === productId);
       if (index !== -1) {
           products[index] = { ...products[index], ...updates };
           saveToLocalStorage();
           renderProducts();
           renderDashboard();
       }
   }
}

async function deleteProductFromSupabase(productId) {
   try {
       const { error } = await supabase
           .from('products')
           .delete()
           .eq('id', productId);
       
       if (error) throw error;
       
       // Update local state
       products = products.filter(p => p.id !== productId);
       renderProducts();
       renderDashboard();
   } catch (error) {
       console.error('Error deleting product:', error.message);
       // Fall back to local delete
       products = products.filter(p => p.id !== productId);
       saveToLocalStorage();
       renderProducts();
       renderDashboard();
   }
}

// Update the addProduct function to use Supabase
async function addProduct() {
   const product = {
       name: document.getElementById('product-name').value,
       brand: document.getElementById('product-brand').value,
       category: document.getElementById('product-category').value,
       purchaseDate: document.getElementById('product-date').value,
       notes: document.getElementById('product-notes').value,
   };
   
   if (supabaseClient && currentUser) {
       await addProductToSupabase(product);
   } else {
       // Fall back to local storage
       product.id = Date.now().toString();
       product.dateAdded = new Date().toISOString();
       products.push(product);
       saveToLocalStorage();
       renderProducts();
       renderDashboard();
   }
   
   // Close modal and reset form
   productModal.style.display = 'none';
   productForm.reset();
}

// Update the deleteProduct function to use Supabase
function deleteProduct(productId) {
   if (confirm('Are you sure you want to delete this product?')) {
       if (supabaseClient && currentUser) {
           deleteProductFromSupabase(productId);
       } else {
           // Fall back to local storage
           products = products.filter(product => product.id !== productId);
           saveToLocalStorage();
           renderProducts();
           renderDashboard();
       }
   }
}

// Add an initialization function to check authentication status
async function initAuth() {
   try {
       const { data: { user } } = await supabase.auth.getUser();
       if (user) {
           currentUser = user;
           document.body.classList.add('authenticated');
           fetchProducts(); // Load data from Supabase
       } else {
           // Not logged in, show auth forms
           document.body.classList.remove('authenticated');
           showAuthForms();
       }
   } catch (error) {
       console.error('Error checking auth status:', error.message);
       // Fall back to local storage
       loadFromLocalStorage();
   }
}

// Update the initApp function to include auth initialization
function initApp() {
   try {
       // Initialize Supabase client
       supabaseClient = supabase;
       console.log('Supabase client initialized');
       
       // Initialize authentication
       initAuth();
   } catch (error) {
       console.error('Error initializing Supabase client:', error);
       // Fall back to local storage
       loadFromLocalStorage();
       renderDashboard();
       renderProducts();
       renderRoutines('morning');
       renderProgressPhotos();
   }
   
   // Set up event listeners
   setupEventListeners();
}