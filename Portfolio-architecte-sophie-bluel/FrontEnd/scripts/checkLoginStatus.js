import { parseJwt } from "./jwt.js";
import { openModal } from "./modals.js";

/**
 * - token n'existe pas
 * - token expiré
 *      --> invalide
 *      --> reset lien login
 */

export function checkLoginStatus() {
    // récupération du token dans le localStorage
    const token = localStorage.getItem('token');

    // sélection des DOM à modifier
    const filtersContainer = document.querySelector('.filters');
    const logLink = document.querySelector('.log-link');

    // sécurité : si les éléments n'existent pas
    if (!filtersContainer || !logLink) return;

    /**
     * On vérifie 2 choses dans cette fonction :
     * - Le token existe
     * - Il est valide (pas expiré)
     */
    const tokenIsValid = verifyTokenIsValid(token);

    if (!tokenIsValid) {
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

    /**
     * A partir d'ici, on considère que le token est valide (il a passé les validations ligne 30)
     */

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
        editButton.classList.add('edit-button', 'js-modal');

        // --- IMPORTANT ---
        // on utilise un data-attribute pour cibler la modal à ouvrir
        editButton.setAttribute('data-modal-target', '#modal1'); 

        editButton.addEventListener('click', (event) => {
            // ouvrir la modal d'édition
            openModal(event);
        });

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


/**
 * @returns {boolean} Le token est valide
 */
function verifyTokenIsValid(token) {
    /**
     * Si pas de token, c'est forcément invalide
     */
    if (!token) {
        return false;
    }

    /**
     * Arrivé ici, j'ai un token. On vérifie l'expiration (la fonction retourne un objet `{ expired: true/false }`)
     */
    const expirationResult = verifyTokenExpiration(token);

    /**
     * On accède à la propriété "expired" (true/false) pour savoir si le token est expiré ou non
     */
    const tokenIsExpired = expirationResult.expired;

    /**
     * Si le token est expiré, le token est invalide
     */
    if (tokenIsExpired) {
        return false
    }

    /**
     * Si on arrivé ici, c'est qu'on a passé toutes les validations, et on considère que le token est valide
     */
    return true
}

/**
 * @param {string} token
 */
function verifyTokenExpiration(token) {
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
        return;
    }
    // convertir en millisecondes
    const parsedTokenExpiration = parsedToken.exp * 1000;
    const currentTime = Date.now(); // temps actuel en millisecondes
    const tokenIsExpired = currentTime >= parsedTokenExpiration;

    return {
        expired: tokenIsExpired
    }
}