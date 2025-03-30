// Supabase Configuration
const SUPABASE_URL = 'https://rgdftwpfyzqxsqoszped.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZGZ0d3BmeXpxeHNxb3N6cGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNDQ3OTAsImV4cCI6MjA1NzcyMDc5MH0.MkE9Xwu9cODqsFEgIyoYPF4YTjU_Pp17vsY63Va5p3o';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');

// Initialize
function initAuth() {
    // Set up event listeners
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchAuthTab(tabId);
        });
    });
    
    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        loginError.textContent = '';
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // Redirect to main app
            window.location.href = 'index.html';
        } catch (error) {
            loginError.textContent = error.message || 'Error signing in. Please try again.';
        }
    });
    
    // Signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        
        signupError.textContent = '';
        
        // Check if passwords match
        if (password !== confirm) {
            signupError.textContent = 'Passwords do not match';
            return;
        }
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });
            
            if (error) throw error;
            
            // Show success message
            signupForm.innerHTML = `
                <div class="success-message">
                    <h3>Thanks for signing up!</h3>
                    <p>Please check your email for the confirmation link.</p>
                    <button type="button" class="btn" onclick="switchAuthTab('login')">Back to Login</button>
                </div>
            `;
        } catch (error) {
            signupError.textContent = error.message || 'Error signing up. Please try again.';
        }
    });
    
    // Check if user is already logged in
    checkAuthStatus();
}

// Switch Auth Tab
function switchAuthTab(tabId) {
    // Update active tab
    authTabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update active form
    authForms.forEach(form => {
        if (form.id === `${tabId}-form`) {
            form.classList.add('active');
        } else {
            form.classList.remove('active');
        }
    });
    
    // Clear error messages
    loginError.textContent = '';
    signupError.textContent = '';
}

// Check Authentication Status
async function checkAuthStatus() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            // Already logged in, redirect to main app
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error checking auth status:', error.message);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);