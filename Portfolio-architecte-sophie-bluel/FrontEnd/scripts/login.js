
export async function loginUser(email, password) {
    const response = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    return await response.json();
}

const loginForm = document.getElementById('login-form');

// conditionne l'ajout du listener à l'existence du formulaire
// car ce script est chargé sur toutes les pages
// afin d'éviter les erreurs JS sur les pages sans formulaire de login
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        // Empêche le rechargement de la page
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const logInData = await loginUser(email, password);
            // Sauvegarde du token dans le localStorage
            localStorage.setItem('token', logInData.token);
            console.log('Login successful:', logInData);
            // Rediriger vers la page principale après une connexion réussie
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Error during login:', error);
            alert('Échec de la connexion. Veuillez vérifier vos identifiants.');
        }
    });
}

export function getEditButton() {
    return document.querySelector('.edit-button');
}