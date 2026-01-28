import { initWorks } from "./works.js";
import { initFilters } from "./filters.js";
import { checkLoginStatus } from "./login.js";

// Le code à exécuter une fois le DOM entièrement chargé
// bugs silencieux si les éléments ne sont pas présents sur la page
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    initWorks();
    initFilters();
});
