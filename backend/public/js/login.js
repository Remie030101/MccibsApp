document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/auth/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Save token and admin info
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminName', data.admin.fullName);
                
                // Redirect to admin dashboard
                window.location.href = '/index.html';
            } else {
                // Show error message
                const errorDiv = document.getElementById('errorMessage');
                errorDiv.textContent = data.message;
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = 'Erreur lors de la connexion';
            errorDiv.style.display = 'block';
        }
    });
}); 