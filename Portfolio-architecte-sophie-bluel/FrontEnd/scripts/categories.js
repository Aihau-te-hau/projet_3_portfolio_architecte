export async function getCategories() {
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        if (!response.ok) {
            throw new Error(`Erreur API categories : ${response.status}`);
        }
        const categories = await response.json();
        console.log(categories);
        return categories;
    } catch (error) {
        console.error("Impossible de charger les catégories :", error);
        return []; // fallback pour éviter que tout casse côté UI
    }
}

export function displayCategories(categories, target) {
    const container = document.querySelector(`.${target}`);
    container.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        container.appendChild(option);
    });
}