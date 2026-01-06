export async function initWorks() {
    const response = await fetch('http://localhost:5678/api/works');
    const works = await response.json();
    console.log(works);
    displayWorks(works);
}

function displayWorks(works) {
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