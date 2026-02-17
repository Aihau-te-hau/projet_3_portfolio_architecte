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
    resetPreview();
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
    initModal2Logic();
}

// reset preview de l'image dans la modal d'ajout de projet à chaque fermeture de la modal pour éviter que l'image précédente reste affichée si l'utilisateur ouvre à nouveau la modal sans sélectionner une nouvelle image
function resetPreview() {
    const imagePreview = document.getElementById('imagePreview');
    const fileInput = document.getElementById('image');
    const titleInput = document.getElementById('title');

    if (imagePreview) imagePreview.src = "./assets/icons/iconImage.png";
    if (fileInput) fileInput.value = "";
    if (titleInput) titleInput.value = "";
}

// logique de la deuxième modale
function initModal2Logic() {

    const fileInput = document.getElementById('image');
    const uploadedButton = document.querySelector('.button-ajout-image');
    const imagePreview = document.getElementById('imagePreview');
    const form = document.forms.namedItem('modal2-form');
    const submitBtn = form.querySelector('.modal2-form-submit');

    // sécurité : si la modal n'existe pas encore dans le DOM on stop
    if (!fileInput || !form) return;

    // on va lier le bouton d'ajout d'image au champ de fichier pour améliorer l'UX, car le champ de fichier est difficile à styliser et pas très engageant pour l'utilisateur, alors que le bouton peut être stylisé pour être plus attrayant et inciter l'utilisateur à cliquer dessus pour sélectionner une image
    uploadedButton.addEventListener('click', () => fileInput.click());

    // preview de l'image sélectionnée
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;

        // FileReader permet de lire le contenu d'un fichier
        // et de le convertir en URL affichable dans une <img>
        const reader = new FileReader();
        reader.onload = e => imagePreview.src = e.target.result;

        // readAsDataURL convertit le fichier en base64
        // → utilisable directement comme src d'une <img> pour l'aperçu
        reader.readAsDataURL(file);

        // on vérifie aussi la validité du formulaire après ajout image
        checkFormValidity();
    });

    // vérification du remplissage des champs afin de modifier le bouton submit
    function checkFormValidity() {
        const title = form.elements['title']?.value;
        const categoryId = form.elements['category']?.value;
        const imageFile = form.elements['image']?.files[0];

        if (title?.trim() && categoryId?.trim() && imageFile) {
            submitBtn.classList.add('active');
            submitBtn.disabled = false;
        } else {
            submitBtn.classList.remove('active');
            // si je veux carrément désactiver le bouton submit tant que le formulaire n'est pas valide, je peux ajouter la ligne ci-dessous, mais j'ai préféré ne pas le faire pour ne pas bloquer l'utilisateur dans sa navigation et éviter les bugs d'invalidité du formulaire qui bloqueraient le bouton submit même si les champs sont remplis
            // submitBtn.disabled = true;
        }
    }

    // écoute des champs pour mise à jour du bouton en temps réel
    form.elements['title'].addEventListener('input', checkFormValidity);
    form.elements['category'].addEventListener('change', checkFormValidity);

    // écoute du submit pour ajouter le projet via l'API et fermer la modal après ajout
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = form.elements['title']?.value;
        const categoryId = form.elements['category']?.value;
        const imageFile = form.elements['image']?.files[0];

        // ici trim pour vérifier que les champs ne sont pas vides ou composés uniquement d'espaces
        // ici ?. vérifie que le champ existe puis fais un trim car il renvoie undifined si !champ, sinon bug silencieux car trim() ne peut pas être appliqué à undefined
        if (!title?.trim() || !categoryId?.trim() || !imageFile) {
            alert('Veuillez remplir tous les champs du formulaire.');
            return;
        }

        const formData = new FormData(form);

        await addWork(formData);

        // on ferme la modal après ajout
        // le refresh galerie est géré dans addWork() grâce à l'appel de initWorks() après l'ajout du projet dans le backend pour éviter les problèmes de synchronisation avec le backend
        closeModal(new Event('click'));
    });
}
