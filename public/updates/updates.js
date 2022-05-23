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


// Buid team cards 

// Get teams

firebase.database().ref('teams').once('value', function (snapshot) {

  document.getElementById("teamList").innerHTML = "";

  snapshot.forEach(function (childSnapshot) {
    var childKey = childSnapshot.key;
    var childData = childSnapshot.val();

    // Build team card
    var team = document.createElement('div');
    team.className = 'card';
    team.id = childKey;

    // Set card color based on team
    team.style.backgroundColor = childData.color;

    // Build team name
    var teamName = document.createElement('span');
    teamName.innerHTML = childData.name;
    teamName.className = 'teamName';

    // Build team points
    var teamPoints = document.createElement('span');
    teamPoints.className = 'points';
    teamPoints.innerHTML = childData.points + " pontos";

    // Build team image
    var teamImage = document.createElement('img');
    teamImage.className = 'teamImage';
    teamImage.src = "files/teams/" + (parseInt(team.id) + 1) + ".webp";

    // Create card header and subheader
    var cardHeader = document.createElement('div');
    cardHeader.className = 'cardHeader';

    var cardSubheader = document.createElement('div');
    cardSubheader.className = 'cardSubheader';

    // Append elements to card header and subheader
    cardSubheader.appendChild(teamName);
    cardSubheader.appendChild(teamPoints);
    cardHeader.appendChild(teamImage);
    cardHeader.appendChild(cardSubheader);
    team.appendChild(cardHeader);

    // Create card body
    var cardBody = document.createElement('div');
    cardBody.className = 'cardBody';

    // List of activities
    var activities = document.createElement('ul');
    activities.className = 'activities';

    // List of activities
    let activityList = [];

    // Get activities from team and put them in an array
    childSnapshot.child('tasks').forEach(function (childSnapshot) {
      activityList.push(childSnapshot.key);
    });

    // If empty, add a message
    if (activityList.length == 0) {
      activities.innerHTML += "<li>Nenhuma atividade concluída</li>";
    }

    // Build activities list
    for (let i = 0; i < activityList.length; i++) {

      // Get activity data
      firebase.database().ref('activities/' + activityList[i]).once('value', function (act) {
        let activity = document.createElement('li');
        activity.innerHTML = act.val().title;
        activities.appendChild(activity);
      });

    }

    // Create teams placeholder
    const teamPlaceholder = document.createElement('div');
    teamPlaceholder.className = 'teamPlaceholder';
    teamPlaceholder.id = 'teamPlaceholder+' + childKey;
    teamPlaceholder.innerHTML = "<h3>Membros da Equipe</h3>";
    cardBody.appendChild(teamPlaceholder);

    // Append activities to card body
    cardBody.innerHTML += "<h3>Atividades concluídas</h3>";
    cardBody.appendChild(activities);

    // Append team to teams
    team.appendChild(cardBody);
    document.getElementById('teamList').appendChild(team);
  })
}).then(loadTeamMembers);

// Distribute team members to team placeholder

function loadTeamMembers() {
  firebase.database().ref("users").once('value', function (snapshot) {

    snapshot.forEach(function (childSnapshot) {

      // Get user data
      let user = childSnapshot.val();

      // Get user team
      let userTeam = user.team;

      // If user has a team
      if (userTeam != null) {

        // Get user team placeholder
        let teamPlaceholder = document.getElementById('teamPlaceholder+' + (userTeam - 1));

        // Create user card
        let userCard = document.createElement('li');
        userCard.className = 'userCard';

        // Fill user card with user data
        userCard.innerHTML = "<text>" + user.name + "</text>";

        // Append user card to team placeholder
        teamPlaceholder.appendChild(userCard);
      }
    });
  });
}

// Header shadow

headerShadow();

function headerShadow() {
  if (document.body.scrollTop == 0 || document.documentElement.scrollTop == 0) {
    document.getElementById("header").className = "headerNoShadow";
  }
  if (document.body.scrollTop != 0 || document.documentElement.scrollTop != 0) {
    document.getElementById("header").className = "";
  }
}

// Default code below

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