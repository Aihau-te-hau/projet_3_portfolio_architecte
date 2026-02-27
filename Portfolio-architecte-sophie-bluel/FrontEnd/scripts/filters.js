// importation des fonctions nécessaires
// car les eventListeners doivent exister après l'affichage des boutons
import { initWorks, displayWorks, getAllWorks } from './works.js';

// fonction pour initialiser les filtres
export async function initFilters() {
    // IMPORTANT
    // vérification et gestion des erreurs
    // suite ou l'arrêt du backend a posé problème qui a duré plusieurs jours
    try {
        const response = await fetch('http://localhost:5678/api/categories');

        if (!response.ok) {
            throw new Error(`Erreur API categories : ${response.status}`);
        }

        const categories = await response.json();
        console.log(categories);
        displayFilters(categories);
    } catch (error) {
        console.error("Impossible de charger les catégories :", error);
        // pas de throw → on laisse l'app continuer à vivre
    }
}

// fonction pour afficher les boutons de filtres
function displayFilters(categories) {
    const filtersContainer = document.querySelector('.filters');
    filtersContainer.innerHTML = ''; // Clear existing content

    // Add "Tous" button
    const allButton = document.createElement('button');
    allButton.dataset.category = 'all';
    allButton.classList.add('filter-button');
    allButton.textContent = 'Tous';

    allButton.addEventListener('click', () => {
        initWorks(); // Re-initialize works to show all
    });

    filtersContainer.appendChild(allButton);

    // Add category buttons
    categories.forEach(category => {
        const button = document.createElement('button');
        button.dataset.category = category.id; // on stocke l'id pour le filtre
        button.classList.add('filter-button');
        button.textContent = category.name;

        // ajout du listener à la création du btn pour eviter le pb de listener qui existe avant que les boutons soient créés
        button.addEventListener('click', async () => {
            // récupère tous les travaux
            const works = await getAllWorks(); 
            // filtre les travaux en fonction de l'id de la catégorie stockée dans le data-attribute du bouton cliqué
            const filteredWorks = works.filter(work => work.category.id === Number(category.id));
            displayWorks(filteredWorks);
        });

        filtersContainer.appendChild(button);
    });
}