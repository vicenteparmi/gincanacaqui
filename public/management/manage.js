// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyA07lUMH1HyCjBi_eKe-4gaz1b9FhdSZiE",
    authDomain: "havarena-f3d87.firebaseapp.com",
    databaseURL: "https://havarena-f3d87.firebaseio.com",
    projectId: "havarena-f3d87",
    storageBucket: "havarena-f3d87.appspot.com",
    messagingSenderId: "259369291947",
    appId: "1:259369291947:web:6233862e160cc6bfce67ee",
    measurementId: "G-STKZ9T8L1C"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Load teams

let teams;
firebase.database().ref('teams').on('value', function (snapshot) {
    teams = snapshot.val();

    // Add teams to option list
    teams.map(function (team, index) {
        const option = document.createElement("option");
        option.value = index;
        option.text = team.name;

        document.getElementById("selectTeam").appendChild(option);

        document.getElementById("pointsTeam").value = teams[0].points;
        document.getElementById("teamImg").src = "files/teams/1.webp";
    });
});

// Modify teams

document.getElementById("selectTeam").addEventListener("change", function () {
    const t = parseInt(document.getElementById("selectTeam").value) + 1;
    document.getElementById("teamImg").src = "files/teams/" + t + ".webp";
    document.getElementById("pointsTeam").value = teams[t - 1].points;
});

function savePoints() {
    const team = document.getElementById("selectTeam").value;
    const points = document.getElementById("pointsTeam").value;

    const confirmSave = confirm("Após salvar, o valor antigo será apagado, deseja mesmo proceder?");

    if (confirmSave == true) {
        firebase.database().ref('teams/' + team).update({
            points: points
        });

        alert("Pointos salvos!");
    } else {
        alert("Pontos não salvos!");
    }
}

// Add activity

function addAtividade() {
    const activityTitle = document.getElementById("addTitulo").value;
    const activityDescription = document.getElementById("addDescricao").value;
    const activityPoints = document.getElementById("addPontos").value;

    // Get chackboxes
    const checkboxes = document.getElementsByName("addCategoria");
    let activityCheckboxes = [];

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            activityCheckboxes.push(checkboxes[i].value);
        }
    }

    // Create json object

    const activity = {
        title: activityTitle,
        description: activityDescription,
        points: activityPoints,
        options: activityCheckboxes
    };

    // Add activity to database and alert if it works

    firebase.database().ref('activities').push(activity).then(function () {
        alert("Atividade adicionada!");
    });


}

// Open and close popups
function openPopup(popup) {
    document.getElementById(popup).style.width = "100%";
    document.getElementById("logo").style.color = "white";
    document.getElementById("menu").style.filter = "brightness(2.5)";
}

function closePopup(popup) {
    document.getElementById(popup).style.width = "0%";
    document.getElementById("logo").style.color = "black";
    document.getElementById("menu").style.filter = "brightness(1)";
}

// Default code

headerShadow();

function headerShadow() {
    if (document.body.scrollTop == 0 || document.documentElement.scrollTop == 0) {
        document.getElementById("header").className = "headerNoShadow";
    }
    if (document.body.scrollTop != 0 || document.documentElement.scrollTop != 0) {
        document.getElementById("header").className = "";
    }
}

var popupShow = false;
var signedIn = false;

function popup() {
    var user = firebase.auth().currentUser;
    const popupLogged = document.getElementById("popupMenuLogged");
    const popupMenu = document.getElementById("popupMenu");
    const userPhoto = document.getElementById("userPhoto");

    if (popupShow == false) {
        if (user) {
            popupLogged.className = "popupMenu";
        } else {
            popupMenu.className = "popupMenu";
        }
        popupShow = true;

        window.onclick = function () {
            if (event.target != popupMenu && event.target != popupLogged && event.target != userPhoto) {
                popupMenu.className = "popupMenu hide";
                popupLogged.className = "popupMenu hide";
                popupShow = false;
            }
        }

    } else {
        popupMenu.className = "popupMenu hide";
        popupLogged.className = "popupMenu hide";
        popupShow = false;
    }

    loadPage();
}

var team;

function loadPage() {
    var user = firebase.auth().currentUser;
    var name, email, photoUrl, uid, emailVerified;

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            emailVerified = user.emailVerified;
            uid = user.uid;

            document.getElementById('userName').innerHTML = name;
            document.getElementById('userEmail').innerHTML = email;
            document.getElementById("userPhoto").style.backgroundImage = "url('" + photoUrl + "')";

            // Define team
            const currentUser = firebase.auth().currentUser;
            var dbRef = firebase.database().ref('users/' + currentUser.uid + "/team");
            dbRef.on('value', function (snapshot) {
                team = snapshot.val();
                // defineBgColor(team); Still haven't decided if this will be kept
            });
        }
    });
}

function signOut() {
    firebase.auth().signOut().then(function () {
        console.log('Signed Out');
        location.reload();
    }, function (error) {
        console.error('Sign Out Error', error);
    });
}

var menuOpen = false;

function openMenu() {
    const menu = document.getElementById("menu");
    const menuHolder = document.getElementById("menuHolder");
    const sandwich = document.getElementById("sandwich");

    if (menuOpen == false) {
        menu.className = "show";
        menuHolder.className = "shadow"
        window.onclick = function () {
            if (event.target != menu && event.target != sandwich) {
                menu.className = "";
                menuHolder.className = ""
                menuOpen = false;
            }
        }
        menuOpen = true;
    } else {
        menu.className = "";
        menuHolder.className = ""
        menuOpen = false;
    }
}