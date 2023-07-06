// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgDMH71uLX2wc-PcwKRFE-LRrW3OU-V4s",
  authDomain: "gincanadaep.firebaseapp.com",
  databaseURL: "https://gincanadaep-default-rtdb.firebaseio.com",
  projectId: "gincanadaep",
  storageBucket: "gincanadaep.appspot.com",
  messagingSenderId: "596615659329",
  appId: "1:596615659329:web:3e560ff9fb5f3060c02bc0",
  measurementId: "G-L0VVV71RJB"
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
    //team.style.backgroundColor = hexToHSL(childData.color);
    team.style = "background-image: linear-gradient(to bottom right, " + hexToHSL(childData.color, 10) + ", " + hexToHSL(childData.color, -10) + ");";

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

    // Create teams title
    var teamsTitle = document.createElement('h3');
    teamsTitle.innerHTML = "Membros da Equipe";
    cardBody.appendChild(teamsTitle);

    // Create teams placeholder
    const teamPlaceholder = document.createElement('div');
    teamPlaceholder.className = 'teamPlaceholder';
    teamPlaceholder.id = 'teamPlaceholder+' + childKey;
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
        let userCard = document.createElement('div');
        userCard.className = 'userCard';

        // Create user image
        let userImage = document.createElement('div');
        userImage.className = 'userImage';
        userImage.style.backgroundImage = "url('" + user.photo + "')";

        // Create user name
        let userName = document.createElement('span');
        userName.className = 'userName';
        userName.innerHTML = user.name;

        // Append user info to user card
        userCard.appendChild(userImage);
        userCard.appendChild(userName);

        // Set veteran class
        if (user.veteran) {
          userCard.classList.add('veteran');
        }

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

window.onload = () => {
  var db = firebase.database();
	var ref = db.ref("settings");
	ref.on("value", function (snapshot) {
		var data = snapshot.val();
		if (data.showSchedule == false) {
			document.getElementById("scheduleNav").style.display = "none";
		}
	});
}

// https://css-tricks.com/converting-color-spaces-in-javascript/
function hexToHSL(H, lvar) {

  // Convert hex to RGB first
  let r = 0, g = 0, b = 0;
  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  if (delta == 0)
    h = 0;
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  else if (cmax == g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0)
    h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  l += lvar;

  return "hsl(" + h + "," + s + "%," + l + "%)";
}