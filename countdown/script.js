// Contagem regressiva para a gincana

const dataFinal = new Date(2022, 5, 6); // TODO: fix the date

// Numbers

let d, h, m, s;
let play = true; // TODO: turn music on
let photoDisplayTime = 1800; // 2000 is the ideal

// Update the count down every 1 second
var x = setInterval(function () {

    // Get today's date and time
    let now = new Date().getTime();

    // Find the distance between now and the count down date
    let distance = dataFinal - now;

    // Time calculations for days, hours, minutes and seconds
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    displayCountdown(days, hours, minutes, seconds);
}, 1000);

function displayCountdown(days, hours, minutes, seconds) {
    const b1 = document.getElementById("b1");
    const b2 = document.getElementById("b2");
    const b3 = document.getElementById("b3");
    const b4 = document.getElementById("b4");

    if (days != d) {
        b1.innerHTML = days;
        b1.classList.add('magictime', 'puffIn');
        d = days;
    }
    if (hours != h) {
        b2.innerHTML = hours;
        b2.classList.add('magictime', 'puffIn');
        h = hours;
    }
    if (minutes != m) {
        b3.innerHTML = minutes;
        b3.classList.add('magictime', 'puffIn');
        m = minutes;
    }
    if (seconds != s) {
        b4.innerHTML = seconds;
        b4.classList.add('magictime', 'puffIn');
        s = seconds;
    }
}