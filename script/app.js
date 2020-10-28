// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
    //Get hours from milliseconds
    const date = new Date(timestamp * 1000);
    // Hours part from the timestamp
    const hours = '0' + date.getHours();
    // Minutes part from the timestamp
    const minutes = '0' + date.getMinutes();
    // Seconds part from the timestamp (gebruiken we nu niet)
    // const seconds = '0' + date.getSeconds();

    // Will display time in 10:30(:23) format
    return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}

//own functions
const getHtmlEl = selector => document.querySelector(selector);

const fillHtmlText = (selector, text) => {
    getHtmlEl(selector).innerHTML = text;
}

const addClass = (selector, classname) =>{
    getHtmlEl(selector).classList.add(classname);
}

const calcMinDiff = (start, end) => ((end.getHours() - start.getHours()) * 60) + (end.getMinutes() - start.getMinutes());


const itBeNight = () => {
    addClass('html', 'is-night');
}

const itBeDay = () => {
    getHtmlEl('html').classList.remove('is-night');
}


// 5 TODO: maak updateSun functie
const updateSun = (sunEl, left, bottom, now) => {
    sunEl.setAttribute("data-time", `${now.getHours()}:${now.getMinutes()}`);
    sunEl.style.bottom = `${bottom}%`
    sunEl.style.left = `${left}%`;

}

const calcAndUpdateSun = (sun, passedSunTime, totalMinSun) => {
    let newPercentage = passedSunTime / (totalMinSun) * 100;
    updateSun(sun, newPercentage, newPercentage < 50 ? newPercentage * 2 : (100 - newPercentage) * 2, new Date());
    fillHtmlText(".js-time-left", Math.round(totalMinSun - passedSunTime));
}


// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
const placeSunAndStartMoving = (totalMinutes, sunrise) => {
    // In de functie moeten we eerst wat zaken ophalen en berekenen.
    // Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
    const sun = getHtmlEl(".js-sun");
    // Bepaal het aantal minuten dat de zon al op is.
    let passedSunTime = calcMinDiff(sunrise, new Date());

    // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ).
    // Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
    calcAndUpdateSun(sun, passedSunTime, totalMinutes)

    // We voegen ook de 'is-loaded' class toe aan de body-tag.
    addClass('body', 'is-loaded')

    // Vergeet niet om het resterende aantal minuten in te vullen.


    // Nu maken we een functie die de zon elke minuut zal updaten
    // Bekijk of de zon niet nog onder of reeds onder is
    // Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
    // PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
    const interval = setInterval(() => {
        if (passedSunTime > totalMinutes) {
            itBeNight();
            clearInterval(interval);
        } else if (passedSunTime < 0) {
            itBeNight();
        } else {
            itBeDay();
            calcAndUpdateSun(sun, passedSunTime, totalMinutes);
            passedSunTime++;
        }

    }, 1000 * 60) //1000 ms == 1 sec *60
};

// 3 Met de data van de API kunnen we de app opvullen
const showResult = queryResponse => {
    // We gaan eerst een paar onderdelen opvullen
    // Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.

    // Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
    fillHtmlText('.js-location', `${queryResponse.city.name}, ${queryResponse.city.country}`)
    fillHtmlText('.js-sunrise', _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise))
    fillHtmlText('.js-sunset', _parseMillisecondsIntoReadableTime(queryResponse.city.sunset))

    const lightStart = new Date(queryResponse.city.sunrise * 1000);
    const lightEnd = new Date(queryResponse.city.sunset * 1000);

    //Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
    // Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
    placeSunAndStartMoving(calcMinDiff(lightStart, lightEnd), lightStart);
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
const getAPI = async (lat, lon) => {
    // Eerst bouwen we onze url op
    const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKEY}&units=metric&lang=nl&cnt=1`
    const customHeaders = new Headers(); // Eigenlijk zijn headers niet nodig met deze backend.
    customHeaders.append('Accept', 'application/json');

    // Met de fetch API proberen we de data op te halen.
    try {
        // Als dat gelukt is, gaan we naar onze showResult functie.
        const response = await fetch(url, {headers: customHeaders});
        showResult(await response.json());

    } catch (err) {
        console.log(`The has been an error, our expert team of monkeys are looking into it!`); // Lol
    }

};

document.addEventListener('DOMContentLoaded', () => {
    // 1 We will query the API with longitude and latitude.
    getAPI(50.8027841, 3.2097454);
});
