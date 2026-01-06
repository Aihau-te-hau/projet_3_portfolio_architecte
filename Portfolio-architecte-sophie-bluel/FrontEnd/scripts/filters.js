export async function initFilters() {
    const response = await fetch('http://localhost:5678/api/categories');
    const categories = await response.json();
    console.log(categories);
    displayFilters(categories);
}

function displayFilters(categories) {
    const filtersContainer = document.querySelector('.filters');
    filtersContainer.innerHTML = ''; // Clear existing content

    // Add "Tous" button
    const allButton = document.createElement('button');
    allButton.setAttribute('data-category', 'all');
    allButton.classList.add('filter-button');
    allButton.textContent = 'Tous';
    filtersContainer.appendChild(allButton);

    // Add category buttons
    categories.forEach(category => {
        const button = document.createElement('button');
        button.setAttribute('data-category', category.name);
        button.classList.add('filter-button');
        button.textContent = category.name;
        filtersContainer.appendChild(button);
    });
}