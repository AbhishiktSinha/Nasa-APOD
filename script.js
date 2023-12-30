// essential values for api call
const api_key = 'vrHqHatFQcHDkMG5wxhzwUgbuQoe0NoywCRfNuhk';
const currDateObject = new Date();
const currDate = currDateObject.toISOString().split('T')[0];
const earliestDate = '1995-06-16';

// essential DOM elements
const root = document.getElementById('root');
const image = document.getElementById('image');
const imageTitle = document.querySelector('.image-title');
const imageDetails = document.querySelector('.image-details');
const displayImageDate = document.getElementById('image-date');
const searchHistoryList = document.getElementById('search-history');


// Defining essential data structures
const searchArray = [];

// form, and form submit event
const form = document.querySelector('form');
form.addEventListener('submit', (event)=> {
    
    event.preventDefault();
    
        const dateValue = form.searchInput.value;
        console.log(dateValue);

    // check if date is valid
    if(!isValidDate(dateValue)) {
        form.reset();
        return;
    }

    // api call for date
    getImageOfTheDay(dateValue);
    // save to localStorage
    saveSearch(dateValue);
    // save to history list
    addSearchToHistory(dateValue);
})

// by default, get history from localStorage, and data for currentDate
populateSearchArray();
getCurrentImageOfTheDay();


function isValidDate(dateValue) {

    console.log(dateValue, currDate, dateValue.localeCompare(currDate));

    if (dateValue.localeCompare(currDate) > 0) {
        alert(`Please enter a date in the range: ${earliestDate} to ${currDate}`);        
        return false;
    }
    if (dateValue.localeCompare(earliestDate) < 0) {
        alert(`Please enter a date in the range: ${earliestDate} to ${currDate}`);
        return false;
    }
    return true;
}

function updateImageSection(responseBody) {
    const hdurl = responseBody.hdurl;
    const url = responseBody.url;
    const new_imageTitle = responseBody.title;
    const new_imageDetails = responseBody.explanation;
    const dateObject = new Date(responseBody.date);

    image.src = url;
    imageTitle.textContent = new_imageTitle;
    imageDetails.textContent = new_imageDetails;
    root.style.backgroundImage = `url(${url})`;

    if (currDate != dateObject.toISOString().split('T')[0]) {
        displayImageDate.textContent = ': '+dateObject.toLocaleDateString();
    }

}

async function getCurrentImageOfTheDay() {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${api_key}`;

    const imageResponse = await fetchImage(url);
    
    if (imageResponse !== null) {
        updateImageSection(imageResponse)
    }
    else {
        showErrorMessage();
    }
    
}

async function getImageOfTheDay(date) {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${api_key}&date=${date}`;

    const imageResponse = await fetchImage(url);

    if(imageResponse !== null) {
        updateImageSection(imageResponse);
    }
    else {
        showErrorMessage();
    }
}

function showErrorMessage() {
    console.log('error in fetching image request');
}

async function fetchImage(url) {

    try {
        const responseObject = await fetch(url);

        if(responseObject.ok) {

            console.log('REMAINING API CALLS:',responseObject.headers.get('X-RateLimit-Remaining'));

            const responseBody = await responseObject.json();
            return responseBody;
        }
        else {
            throw new Error('ERROR: error in fetching requested URL');
        }
    }
    catch(e) {
        console.log(e);
        return null;
    }
    
}


function populateSearchArray() {
    if (localStorage.getItem('searches')) {

        searchArray.push(...JSON.parse(localStorage.getItem('searches')));

        searchArray.forEach((dateObject)=> {
            addSearchToHistory(dateObject.date);
        })
    }
}

function saveSearch(dateValue) {
    // saving in file
    searchArray.push({'date':dateValue});

    // saving to localStorage, just for display purpose
    localStorage.setItem('searches', JSON.stringify(searchArray));    
}

function addSearchToHistory(dateValue) {

    // hide placeholder
    const placeholder = searchHistoryList.parentElement.querySelector('.previous-search-placeholder');
    if (!placeholder.classList.contains('hide')) {
        placeholder.classList.add('hide');
    }
    

    // create new list element and add it to the list
    const listElement = createListElement();
    searchHistoryList.appendChild(listElement);


    function createListElement() {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = dateValue;

        link.addEventListener('click', (event)=> {
            event.preventDefault();

            console.log('clicked old search');

            getImageOfTheDay(dateValue);
        });

        li.appendChild(link);
        return li;
    }
}

