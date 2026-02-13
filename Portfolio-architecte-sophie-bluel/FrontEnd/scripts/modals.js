import { getAllWorks, addWork, deleteWork } from './works.js';
import { getCategories } from './categories.js';

// variable permettant de savoir quelle modal est ouverte
let modal = null;

export const closeModal = (event) => {
    if (modal === null) return;
    event.preventDefault();
    modal.style.display = 'none';
    modal.removeAttribute('aria-modal');
    modal.setAttribute('aria-hidden', 'true');
    modal.removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').removeEventListener('click', closeModal);
    modal = null;
}

export const openModal = (event) => {
    // event.preventDefault() pour éviter les comportements par défaut du navigateur (ex: suivre un lien, soumettre un formulaire) qui pourraient interférer avec l'ouverture de la modal
    event.preventDefault();
    // stopPropagation pour éviter que le click sur la modal ne se propage à son parent qui a lui même un listener de fermeture de modal, ce qui fermerait la modal immédiatement après son ouverture
    event.stopPropagation();
    
    // console log pour debug
    console.log(event.currentTarget);

    const querySelector = event.currentTarget.getAttribute('data-modal-target');
    console.log(querySelector);

    const target = document.querySelector(querySelector);
    console.log(target);

    // fermer la modale actuelle si elle existe
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }

    target.removeAttribute('style');
    target.removeAttribute('aria-hidden');
    target.setAttribute('aria-modal', 'true');

    modal = target;
    
    modal.addEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal);

    // empêche la propagation du click sur le contenu de la modal pour éviter de déclencher le listener de fermeture de la modal qui est sur le parent
    // on cible le wrapper de la modal pour éviter que les clicks sur les éléments de la modal ne ferment la modal
    modal.querySelector('.modal-wrapper')
     .addEventListener('click', event => event.stopPropagation());

    // injection des travaux dans la modal d'édition des projets
    if(querySelector === '#modal1') {
        getAllWorks().then(works => {
            const gallery = modal.querySelector('.modal1-gallery');
            gallery.innerHTML = ''; // Clear existing content
            works.forEach(work => {
                const figure = document.createElement('figure');
                const img = document.createElement('img');
                const iconDelete = document.createElement('button');
                figure.classList.add('modal-works-figure');
                img.src = work.imageUrl;
                img.alt = work.title;
                img.classList.add('modal-image');
                iconDelete.innerHTML = '<img src="./assets/icons/Delete.png" alt="Supprimer" class="modal-works-delete-icon">';
                iconDelete.classList.add('modal-works-delete-button');

                // Ajout d'un listener de suppression pour chaque bouton de suppression
                iconDelete.addEventListener('click', async () => {
                    await deleteWork(work.id);

                    refreshModalWorks();
                });

                figure.appendChild(img);
                figure.appendChild(iconDelete);
                gallery.appendChild(figure);
            });
        });
    }
    // injection des catégories dans la modal d'ajout de projet
    if(querySelector === '#modal2') {
        getCategories().then(categories => {
            const select = modal.querySelector('select');
            select.innerHTML = '';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        });
    }
}

export const initModals = () => {
    // on utilise un data-attribute pour cibler les éléments qui ouvrent les modals, ce qui permet de ne pas dépendre de classes ou d'ids spécifiques et de pouvoir réutiliser le même code pour plusieurs modals
    const modalTriggers = document.querySelectorAll('.js-modal');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', openModal);
    });
}