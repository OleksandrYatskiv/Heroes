const API = 'https://64d605d1754d3e0f1361798e.mockapi.io/';

async function controller(action, method = 'GET', body) {
    const URL = `${API}${action}`;
    const headers = {
        'Content-type': 'application/json; charset=UTF-8',
    };

    const params = {
        method: method,
        headers,
    };

    if (body) params.body = JSON.stringify(body);

    try {
        const response = await fetch(URL, params);
        const data = await response.json();

        return data;
    } catch (err) {
        console.log(err);
    }
}

const addBtn = document.querySelector('#addButton');
const name = document.querySelector('#heroName');
const selectedComics = document.querySelector('[data-name="heroComics"]');
const favourite = document.querySelector('[data-name="heroFavourite"]');
const table = document.querySelector('#heroesTable');
const comicsSelect = document.querySelector('[data-name="heroComics"]');

const tbody = document.createElement('tbody');

document.addEventListener('DOMContentLoaded', async () => {
    await showComics();
});


addBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (await IsInDatabase(name.value)) {
        alert('This hero already exists.');
    } else {
        addToDatabase(name.value, selectedComics.value, favourite.checked);
    }
    await showHeroes(name.value, selectedComics.value);

    const favouriteList = document.querySelectorAll('[data-name="favourites"]');
    favouriteList.forEach(checkbox => {
        checkbox.addEventListener('change', async () => {
            const id = checkbox.getAttribute('id');
            const checked = checkbox.checked ? true : false;

            const body = {
                favourite: checked,
            }

            controller(`/heroes/${id}`, 'PUT', body);
        });
    });
});

async function showComics() {
    const comicsData = await controller('universes');
    comicsData.forEach(comicsName => {
        const comics = document.createElement('option');
        comics.value = comicsName.name;
        comics.innerText = comicsName.name;
        comicsSelect.appendChild(comics);
    });
}

async function addToDatabase(name, comics, favourite) {
    const body = {
        name,
        comics,
        favourite,
    }
    controller('heroes', 'POST', body);
}

async function IsInDatabase(name) {
    const heroes = await controller('heroes');
    const hero = heroes.filter(hero => hero.name === name);

    return hero.length === 1 ? true : false;
}

async function showHeroes() {
    tbody.innerHTML = '';

    const heroes = await controller('heroes');
    heroes.forEach(hero => {
        const checked = hero.favourite ? 'checked' : '';
        tbody.innerHTML +=
            `<tr>
            <td>${hero.name}</td>
            <td>${hero.comics}</td>
            <td>
                <label class="heroFavouriteInput">
                    Favourite: <input id="${hero.id}" data-name="favourites" type="checkbox" ${checked}>
                </label>
            </td>
            <td><button id="${hero.id}" data-name="deleteBtn">Delete</button></td>
        </tr>`;
    });
    table.append(tbody);

    const deleteBtns = document.querySelectorAll('[data-name="deleteBtn"]');
    deleteBtns.forEach(deleteBtn => {
        deleteBtn.addEventListener('click', () => {
            deleteHero(deleteBtn.id);
        });
    });
}

async function deleteHero(heroId) {
    await controller(`heroes/${heroId}`, 'DELETE');
    showHeroes();
}
