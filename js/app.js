document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Initialize Supabase (replace with your Supabase URL and API key)
    const SUPABASE_URL = 'https://rgdftwpfyzqxsqoszped.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZGZ0d3BmeXpxeHNxb3N6cGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNDQ3OTAsImV4cCI6MjA1NzcyMDc5MH0.MkE9Xwu9cODqsFEgIyoYPF4YTjU_Pp17vsY63Va5p3o';
    
    // Using the global supabase object correctly
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Add this function after initializing supabaseClient
async function initializeAuth() {
  // Check if user is already authenticated
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  if (!session) {
    // If not authenticated, sign in anonymously (for development purposes)
    const { data, error } = await supabaseClient.auth.signInAnonymously();
    if (error) {
      console.error("Authentication error:", error);
      alert("Error with authentication. Some features may not work.");
      return false;
    } else {
      console.log("Authenticated successfully");
      return true;
    }
  } else {
    console.log("Already authenticated");
    return true;
  }
}

    // DOM Elements
    const tabs = document.querySelectorAll('nav a');
    const tabContents = document.querySelectorAll('.tab-content');
    const addProductBtn = document.getElementById('add-product-btn');
    const productModal = document.getElementById('product-modal');
    const closeModal = document.querySelector('.close');
    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('product-list');
    const routineTypes = document.querySelectorAll('.routine-type');
    const routineContainer = document.getElementById('routine-container');
    const addRoutineBtn = document.getElementById('add-routine-btn');
    const addPhotoBtn = document.getElementById('add-photo-btn');
    const progressTimeline = document.getElementById('progress-timeline');

    // Debugging: Log elements to ensure they are correctly selected
    console.log('Tabs:', tabs);
    console.log('Add Product Button:', addProductBtn);
    console.log('Product Modal:', productModal);
    console.log('Close Modal:', closeModal);
    console.log('Product Form:', productForm);

    // Event Listeners

    // Tab Navigation
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = tab.getAttribute('data-tab');
            console.log('Tab clicked:', targetTab);

            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to the clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Open Product Modal
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            console.log('Add Product Button clicked');
            productModal.style.display = 'block';
        });
    } else {
        console.error('Add Product Button not found');
    }

    // Close Product Modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            console.log('Close Modal clicked');
            productModal.style.display = 'none';
        });
    } else {
        console.error('Close Modal button not found');
    }

    // Also close modal when clicking outside of it
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.style.display = 'none';
        }
    });

    // Handle Product Form Submission
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Product Form submitted');

            const productName = document.getElementById('product-name').value;
            const productBrand = document.getElementById('product-brand').value;
            const productCategory = document.getElementById('product-category').value;
            const productDate = document.getElementById('product-date').value;
            const productNotes = document.getElementById('product-notes').value;

            try {
                // Save product to Supabase
                const { data, error } = await supabaseClient
                    .from('products')
                    .insert([{ 
                        name: productName, 
                        brand: productBrand, 
                        category: productCategory, 
                        purchase_date: productDate, 
                        notes: productNotes 
                    }]);

                if (error) {
                    console.error('Error saving product:', error);
                    alert('Error saving product: ' + error.message);
                } else {
                    console.log('Product saved:', data);
                    productModal.style.display = 'none';
                    productForm.reset();
                    loadProducts();
                }
            } catch (err) {
                console.error('Exception when saving product:', err);
                alert('An error occurred while saving the product.');
            }
        });
    } else {
        console.error('Product Form not found');
    }

    // Load Products
    async function loadProducts() {
        try {
            const { data, error } = await supabaseClient
                .from('products')
                .select('*');

            if (error) {
                console.error('Error loading products:', error);
                productList.innerHTML = '<p class="empty-state">Error loading products. Please try again.</p>';
            } else {
                productList.innerHTML = ''; // Clear existing products
                if (!data || data.length === 0) {
                    productList.innerHTML = '<p class="empty-state">No products added yet. Add your first product!</p>';
                } else {
                    data.forEach(product => {
                        const productCard = document.createElement('div');
                        productCard.className = 'product-card';
                        productCard.innerHTML = `
                            <h3>${product.name}</h3>
                            <p><strong>Brand:</strong> ${product.brand}</p>
                            <p><strong>Category:</strong> ${product.category}</p>
                            <p><strong>Date:</strong> ${product.purchase_date || 'Not specified'}</p>
                            <p><strong>Notes:</strong> ${product.notes || 'None'}</p>
                        `;
                        productList.appendChild(productCard);
                    });
                }
            }
        } catch (err) {
            console.error('Exception when loading products:', err);
            productList.innerHTML = '<p class="empty-state">Error loading products. Please try again.</p>';
        }
    }

    // Routine Type Selection
    if (routineTypes && routineTypes.length > 0) {
        routineTypes.forEach(type => {
            type.addEventListener('click', () => {
                routineTypes.forEach(t => t.classList.remove('active'));
                type.classList.add('active');
                const routineType = type.getAttribute('data-type');
                console.log('Routine Type clicked:', routineType);
                loadRoutines(routineType);
            });
        });
    } else {
        console.error('Routine Types not found');
    }

    // Load Routines
    async function loadRoutines(type) {
        try {
            const { data, error } = await supabaseClient
                .from('routines')
                .select('*')
                .eq('type', type);

            if (error) {
                console.error('Error loading routines:', error);
                routineContainer.innerHTML = '<p class="empty-state">Error loading routines. Please try again.</p>';
            } else {
                routineContainer.innerHTML = ''; // Clear existing routines
                if (!data || data.length === 0) {
                    routineContainer.innerHTML = '<p class="empty-state">No routines added yet. Build your first routine!</p>';
                } else {
                    data.forEach(routine => {
                        const routineCard = document.createElement('div');
                        routineCard.className = 'routine-card';
                        routineCard.innerHTML = `
                            <h3>${routine.name}</h3>
                            <p><strong>Steps:</strong> ${routine.steps || 'No steps added'}</p>
                        `;
                        routineContainer.appendChild(routineCard);
                    });
                }
            }
        } catch (err) {
            console.error('Exception when loading routines:', err);
            routineContainer.innerHTML = '<p class="empty-state">Error loading routines. Please try again.</p>';
        }
    }

    // Add Routine
    if (addRoutineBtn) {
        addRoutineBtn.addEventListener('click', () => {
            console.log('Add Routine Button clicked');
            alert('Add Routine functionality coming soon!');
        });
    } else {
        console.error('Add Routine Button not found');
    }

    // Add Progress Photo
    if (addPhotoBtn) {
        addPhotoBtn.addEventListener('click', () => {
            console.log('Add Progress Photo Button clicked');
            alert('Add Progress Photo functionality coming soon!');
        });
    } else {
        console.error('Add Progress Photo Button not found');
    }

    // Initial Load
    loadProducts();
    loadRoutines('morning'); // Default to morning routine
});