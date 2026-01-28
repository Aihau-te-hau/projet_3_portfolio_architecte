import { parseJwt } from "./jwt.js";

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

// 
export function checkLoginStatus() {
    // récupération du token dans le localStorage
    const token = localStorage.getItem('token');

    // sélection des DOM à modifier
    const filtersContainer = document.querySelector('.filters');
    const logLink = document.querySelector('.log-link');

    // sécurité : si les éléments n'existent pas
    if (!filtersContainer || !logLink) return;

    // cas token absent
    if (!token) {
        // remettre l'interface par défaut
        filtersContainer.style.display = '';
        // Remplacer le lien de logout par login
        // cloner l'élément pour enlever les anciens listeners
        const newLogLink = logLink.cloneNode(true);
        // replace de l'ancien par le clone propre (qui n'a pas de listener)
        logLink.replaceWith(newLogLink);
        newLogLink.innerText = 'login';
        newLogLink.href = 'views/login.html';        
        return; // sortir de la fonction
    }

    // parse du token pour vérifier sa validité
    // IMPORTANT: UN TOKEN PEUT ÊTRE PRÉSENT MAIS EXPIRÉ
    // cela peut créer des bugs si on ne le gère pas
    // car on pourrait croire que l'utilisateur est connecté alors que son token n'est plus valide et le backend le refusera
    let parsedToken;
    // gestion de token corrompu
    try {
        parsedToken = parseJwt(token);
    } catch (e) {
        console.warn("Token invalide, suppression");
        localStorage.removeItem("token");
        filtersContainer.style.display = '';
        return;
    }
    // convertir en millisecondes
    const parsedTokenExpiration = Math.floor(parsedToken.exp * 1000); 
    const currentTime = Date.now(); // temps actuel en millisecondes

    // cas token expiré
    if (currentTime >= parsedTokenExpiration) {
        // remettre l'interface par défaut
        filtersContainer.style.display = '';

        // IMPORTANT: SUPPRIMER LES ANCIENS LISTENERS
        // pour éviter d'avoir plusieurs listeners attachés au même élément à chaque appel de checkLoginStatus ou rechargement de la page
        // solution: 
        // cloner l'élément pour enlever les anciens listeners
        const newLogLink = logLink.cloneNode(true);
        // remplacer l'ancien par le clone  propre (qui n'a pas de listener)
        logLink.replaceWith(newLogLink);
        // Remplacer le lien de logout par login
        newLogLink.innerText = 'login';
        newLogLink.href = 'views/login.html';

        return; // sortir de la fonction
    }

    // Si token existe, l'utilisateur est connecté
    // Modifier l'interface en conséquence
    // Enlever les filtres
    filtersContainer.style.display = 'none';

    // nettoyer les anciens listeners avant d'en ajouter un nouveau
    // voir plus haut pour explications
    const newLogLink = logLink.cloneNode(true);
    logLink.replaceWith(newLogLink);

    // Remplacer le lien de login par logout
    newLogLink.innerText = 'logout';
    newLogLink.href = '#';
    newLogLink.addEventListener('click', () => {
        // Supprimer le token du localStorage pour déconnecter l'utilisateur
        localStorage.removeItem('token');
        // Recharger la page pour mettre à jour l'interface
        window.location.reload();            
    });

    // vérifier si le bandeau d'édition n'existe pas déjà pour éviter les cumuls de bandeaux lors de rechargements
    if (!document.querySelector('.edit-banner')) {
        // création et insertion du bandeau
        const banner = document.createElement('div');
        banner.classList.add('edit-banner');
        
        // ajout de l'icône d'édition
        const bannerImg = document.createElement('img');
        bannerImg.src = './assets/icons/VectorWhite.png';
        bannerImg.alt = 'Image d\'édition';
        bannerImg.classList.add('edit-icon');
        banner.appendChild(bannerImg);

        // ajout du texte
        // createTextNode est plus précis que innerText ou textContent lorsque l'on veut ajouter du texte avec d'autres éléments
        const bannerText = document.createTextNode('Mode édition');
        banner.appendChild(bannerText);

        // sélection du DOM pour l'insertion du bandeau de témoin d'édition
        const body = document.body;
        const header = document.querySelector('header');
        body.insertBefore(banner, header);
    }

    // ajout du bouton "modifier" après le titre "Mes projets"
    const projectsTitle = document.querySelector('#portfolio h2');
    // vérification de l'existence de l'élément
    // pour éviter les cumuls de boutons lors de rechargements
    if (projectsTitle && !projectsTitle.querySelector('.edit-button')) {
        const editButton = document.createElement('button');
        editButton.classList.add('edit-button');
        
        const editButtonImg = document.createElement('img');
        editButtonImg.src = './assets/icons/VectorBlack.png';
        editButtonImg.alt = 'Image de modification';
        editButtonImg.classList.add('edit-icon');
        editButton.appendChild(editButtonImg);

        const editButtonText = document.createTextNode('modifier');
        editButton.appendChild(editButtonText);

        projectsTitle.appendChild(editButton);
    }
}