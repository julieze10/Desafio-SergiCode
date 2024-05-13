class Photo {
    constructor(json){
        Object.assign(this, json);
    }
    showModal(){
        Swal.fire({
            width: '50rem',
            imageUrl: this.src.large2x,
            imageWidth: '60%',  
            showConfirmButton: false,  
            imageAlt: this.alt,
            footer: `<p>Foto por: ${this.photographer}</p>`
        });
    }
}

// La API key que pedí a la API de Pexels.
const API_KEY = '563492ad6f9170000100000124f75ece770b47a49b4bfa89770d506a';
const HEADERS = {
    method: 'GET', 
    headers: {
        Accept: 'application/json',
        Authorization: API_KEY
    }
}

// Definimos los elementos del DOM que necesitaremos.
let topBtn = document.getElementById('topBtn')
let loadMoreBtn = document.getElementById('loadMoreBtn');
let errorAlert = document.getElementById('errorAlert');
let clearInputButton = document.getElementById('clearInput');
let searchForm = document.getElementById('searchForm');
let gallery = document.getElementById('gallery');
let galleryContainer = document.getElementById('galleryContainer');


// Creamos una función que nos permita eliminar todos los hijos de un elemento.
const removeAllChild = (parent) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

// Definimos algunas variables globales que necesitaremos.
let pageIndex = 1;
let searchValue;

// Creamos una función que nos permita realizar el fetch a partir de una URL y retornar la 'data' para asi trabajarla como querramos.
const fetchPhotos = async (baseURL) => {
    const res = await fetch(baseURL, HEADERS);
    const data = await res.json();
    return data;
}

// Creamos una función que valide lo ingresado por el usuario.
const validateSearchValue = (searchValue) => {
    if (searchValue.length < 3){
        errorAlert.innerText = 'Debe introducir una palabra mayor a 3 letras.';
        setTimeout(() => {
            errorAlert.innerText = '';
        }, 1500);
    }else{
        return true;
    }
}

// Creamos una función que nos permita mapear las fotos devueltas por la API, crear una instancia del objeto Photo a partir de los datos de la API, y crear su respectivo elemento en HTML.
const generateHTML = (data, photoType) => {
    data.photos.forEach((photoObject) => {
        const photo = new Photo(photoObject);
        let newGalleryItem = document.createElement('article');
        newGalleryItem.classList.add('gallery__item');
        newGalleryItem.setAttribute('data-photo', photoType);
        newGalleryItem.innerHTML = `<img src="${photo.src.large}" alt="${photo.alt}"></img>`;
        galleryContainer.append(newGalleryItem);
        newGalleryItem.addEventListener('click', () => photo.showModal());
    });
}

// Creamos una función que nos permita validar algunos errores para asi mostrarlos por el HTML.
const validateErrors = (data, searchValue) => {
    if (!data.next_page){
        loadMoreBtn.style.display = 'none'
    }
    if (data.photos.length === 0){
        let textError = document.createElement('h2');
        textError.innerText = `No se encontraron fotos de '${searchValue}'`;
        gallery.prepend(textError);
    }
}

// Creamos una función que nos devuelva las fotos a partir de lo ingresado por el usuario en la barra de búsqueda.
const getSearchedPhotos = async (e) => {
    e.preventDefault();
    searchValue = e.target.querySelector('input').value;
    if (validateSearchValue(searchValue) === true){
        const data = await fetchPhotos(`https://api.pexels.com/v1/search?query=${searchValue}&per_page=16`);
        validateErrors(data, searchValue);
        removeAllChild(galleryContainer);
        generateHTML(data, 'search');
    }
}

// Creamos una función que nos devuelva otras páginas de fotos respecto de la búsqueda anterior.
const getMoreSearchedPhotos = async (index) => {
    const data = await fetchPhotos(`https://api.pexels.com/v1/search?query=${searchValue}&per_page=16&page=${index}`);
    validateErrors(data, searchValue);
    generateHTML(data, 'search');
}

// Creamos una función que nos devuelva fotos aleatorias.
const getInitialRandomPhotos = async (index) => {
    const data = await fetchPhotos(`https://api.pexels.com/v1/curated?per_page=16&page=${index}`);
    if (!data.next_page){
        loadMoreBtn.style.display = 'none'
    }
    generateHTML(data, 'curated');
}

// Creamos una funcióm que nos permita cargar las paginaciones dependiendo del tipo de foto.
const loadMorePhotos = () => {
    let index = ++pageIndex;
    let galleryItem = document.querySelector('article');
    let dataPhoto = galleryItem.getAttribute('data-photo')
    if (dataPhoto == 'curated'){
        getInitialRandomPhotos(index); 
    }else{
        getMoreSearchedPhotos(index); 
    }
}

// Creamos una función que nos permita limpiar el 'value' del input además de limpiar la galería según su contenido.
const clearInputAndGallery = () => {
    let pageIndex = 1;
    document.getElementById('searchInput').value = '';
    if (gallery.childNodes.length === 5){
        removeAllChild(galleryContainer);
        getInitialRandomPhotos(pageIndex);
    }else{
        gallery.childNodes[0].remove();
        removeAllChild(galleryContainer);
        getInitialRandomPhotos(pageIndex);
    }
    loadMoreBtn.style.display = 'flex';
}


/****  EVENTOS  ****/

// Cuando se carge la ventana, llamamos a la función que nos carga 8 fotos simulando que son fotos aleatorias.
document.addEventListener('DOMContentLoaded', getInitialRandomPhotos(pageIndex));
searchForm.addEventListener('submit', (e) => getSearchedPhotos(e));
loadMoreBtn.addEventListener('click', () => loadMorePhotos());
clearInputButton.addEventListener('click', () => clearInputAndGallery());
window.addEventListener("scroll", () => {
    if (window.scrollY > 1){
        topBtn.style.display = 'flex';
    }else if(window.scrollY < 1){
        topBtn.style.display = 'none';
    }
})

/*******************/



/****  TOGGLE THEME FUNCIONALITY  ****/

let toggleTheme = document.getElementById('toggleTheme');
let ball = document.getElementById('ball');
let theme = localStorage.getItem('theme');

// Creamos una función que nos permita habiltar el tema oscuro de la página, agregando la clase correspondiente al body y seteando el local storage para guardar el modo.
const enableDarkTheme = () => {
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'darkTheme');
    ball.style.transform = 'translateX(20px)';
}

// Creamos una función que nos permita deshabiltar el tema oscuro de la página, removiendo la clase al body y seteando el local storage para guardar el modo.
const disableDarkTheme = () => {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'normal');
    ball.style.transform = 'translateX(0)';
}

theme === 'darkTheme' ? enableDarkTheme() : disableDarkTheme();

// Cuando se aplique el evento click al botón toggle, si el local storage 'theme' no es 'darkTheme', lo habilitamos y sino lo deshabilitamos.
toggleTheme.addEventListener('click', () => {
    theme = localStorage.getItem('theme');
    theme != 'darkTheme' ? enableDarkTheme() : disableDarkTheme();
});


