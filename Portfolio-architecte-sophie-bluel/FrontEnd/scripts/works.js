let allWorks = [];
// fonction pour obtenir tous les travaux (utilisée dans les filtres)
export async function getAllWorks() {
    // IMPORTANT
    // verification et gestion des erreurs
    // suite ou l'arrêt du backend a posé problème qui a duré plusieurs jours
    try {
        const response = await fetch('http://localhost:5678/api/works');

        if (!response.ok) {
            throw new Error(`Erreur API works : ${response.status}`);
        }

        const works = await response.json();
        return works;
    } catch (error) {
        console.error("Impossible de charger les works :", error);
        return []; // fallback pour éviter que tout casse côté UI
    }
}

// initialisation et affichage des travaux
export async function initWorks() {
    allWorks = await getAllWorks();
    console.log(allWorks);
    displayWorks(allWorks);
}

// fonction pour afficher les travaux dans la galerie
export function displayWorks(works) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = ''; // Clear existing content
    
    works.forEach(work => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        const title = document.createElement('figcaption');

        img.src = work.imageUrl;
        img.alt = work.title;
        title.innerText = work.title;

        figure.appendChild(img);
        figure.appendChild(title);
        gallery.appendChild(figure);
    });
}

// fonction pour ajouter un travail (utilisée dans la modal d'ajout de projet)
export async function addWork(workData) {
    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: workData
        });
        if (!response.ok) {
            throw new Error(`Erreur API add work : ${response.status}`);
        }
        const newWork = await response.json();
        allWorks.push(newWork);
        displayWorks(allWorks);
    }   catch (error) {
        console.error("Impossible d'ajouter le travail :", error);
        // pas de throw → on laisse l'app continuer à vivre
    }
}

// fonction pour supprimer un travail (utilisée dans la modal d'édition)
export async function deleteWork(workId) {
    try {
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error(`Erreur API delete work : ${response.status}`);
        } else {
            // allWorks = allWorks.filter(work => work.id !== workId);
            // displayWorks(allWorks);
            // appel de initWorks à la place du bloc de code ci-dessus pour éviter les problèmes de synchronisation avec le backend
            await initWorks();
        }
    } catch (error) {
        console.error("Impossible de supprimer le travail :", error);
        // pas de throw → on laisse l'app continuer à vivre
    }
}