import {getEditButton} from './login.js';
import { getAllWorks } from './works.js';

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
    event.preventDefault();
    // console log pour debug
    console.log(event.currentTarget);

    const target = document.querySelector(event.target.getAttribute('data-modal-target'));
    
    target.removeAttribute('style');
    target.removeAttribute('aria-hidden');
    target.setAttribute('aria-modal', 'true');
    modal = target;
    
    modal.addEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal);
}



document.querySelectorAll('.js-modal').forEach(a => {
    a.addEventListener('click', openModal);
});
