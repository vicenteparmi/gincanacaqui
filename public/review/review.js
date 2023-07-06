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

// Now my code ;D

// Get all images

var storageRef = firebase.storage().ref().child('review');
// const teamColors = ["#005c8d", "#c43030", "#d1ad1e", "#00b661", "#94007e", "#4d4d4d", "#e7660b", "#00b87e", "#e91e63", "#009ae6", "#9e9c00", "#00a89b", "#a9a9a9", "#172c88", "#653c32", "#01be87"];
let activityList = [];
let teamList = [];


// Inflate interface

function inflateInterface() {
  const listHolder = document.getElementById('activitiesHolder');

  // Get all activities to review
  firebase.database().ref('activities').on('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      activityList[childSnapshot.key] = childSnapshot.val();
    });
  });

  // Get all teams
  firebase.database().ref('teams').on('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      teamList[childSnapshot.key] = childSnapshot.val();
    });
  });

  // Get all activities to review

  firebase.database().ref('review').once('value', function (snapshot) {

    // Clear list
    listHolder.innerHTML = "";

    snapshot.forEach(function (childSnapshot) {
      // Show all tasks to approve
      const title = activityList[childSnapshot.val().activity].title;
      const description = activityList[childSnapshot.val().activity].description;
      const answer = childSnapshot.val().answer;
      const team = teamList[childSnapshot.val().team - 1].name;

      const color = teamList[childSnapshot.val().team - 1].color;

      let imageURLs = [];

      if (childSnapshot.val().imageURLs != null) {
        imageURLs = childSnapshot.val().imageURLs;
      }

      const user = firebase.database().ref('users/' + childSnapshot.val().userId);
      let userName = "";
      let userEmail = "";

      user.once('value', function (snap) {
        userName = snap.val().name;
        userEmail = snap.val().email;
      }).then(function () {
        const card = buildCard(title, description, answer, team, color, userName, userEmail, imageURLs, childSnapshot.key, childSnapshot.val().date);
        listHolder.appendChild(card);
      });
    });

    // If empty
    if (snapshot.numChildren() == 0) {
      listHolder.innerHTML = "<h3>Não há nada para avaliar!</h3>";
    }
  });
}

function buildCard(actTitle, actDescription, answerInput, teamName, color, userName, userEmail, imageURLs, reference, date) {
  // Create all elements
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardHeader = document.createElement('div');
  const teamString = document.createElement('h2');
  const summary = document.createElement('span');
  const ativityTitle = document.createElement('h3');
  const ativityDescription = document.createElement('p');
  const answerText = document.createElement('h3');
  const answer = document.createElement('p');

  // Set all elements attributes
  card.className = "card";
  cardBody.className = "card-body";
  cardHeader.className = "card-header";
  teamString.className = "card-title";
  summary.className = "card-text";
  ativityTitle.className = "card-title";
  ativityDescription.className = "card-text";
  answerText.className = "answer-text";
  answer.className = "card-text";

  // Set id to card body
  cardBody.id = reference;

  // Set all elements text
  teamString.innerHTML = teamName;
  summary.innerHTML = "Enviado por " + userName + " (" + userEmail + ") em " + new Date(date).toLocaleString() + ".";
  ativityTitle.innerHTML = actTitle;
  ativityDescription.innerHTML = actDescription;
  answerText.innerHTML = "Resposta:";
  answer.innerHTML = urlify(answerInput);

  // Create image elements
  const imageHolder = document.createElement('div');
  imageHolder.className = "image-holder";

  if (imageURLs.length > 0) {
    imageURLs.forEach(function (url) {
      const image = document.createElement('img');
      image.src = url;
      image.className = "img-fluid";
      imageHolder.appendChild(image);
    });
  }

  // Change header color
  cardHeader.style.backgroundColor = color;

  // Create buttons
  const buttons = document.createElement('div');
  const approveButton = document.createElement('button');
  const rejectButton = document.createElement('button');

  buttons.id = "buttons+" + reference;

  // Set buttons attributes
  approveButton.className = "btn btn-success";
  rejectButton.className = "btn btn-danger";

  // Set buttons text
  approveButton.innerHTML = "Aprovar";
  rejectButton.innerHTML = "Rejeitar";

  // Set buttons events
  approveButton.addEventListener('click', function () {
    approve(reference);
  });

  rejectButton.addEventListener('click', function () {
    reject(reference);
  });

  // Append all elements
  cardHeader.appendChild(teamString);
  cardHeader.appendChild(summary);

  buttons.appendChild(approveButton);
  buttons.appendChild(rejectButton);

  cardBody.appendChild(ativityTitle);
  cardBody.appendChild(ativityDescription);
  cardBody.appendChild(answerText);
  cardBody.appendChild(answer);
  cardBody.appendChild(imageHolder);
  cardBody.appendChild(buttons);

  card.appendChild(cardHeader);
  card.appendChild(cardBody);

  return card;
}

// Accept review

function approve(reference) {

  // Add points to team

  const review = firebase.database().ref('review/' + reference);

  review.once('value', function (snapshot) {
    const activity = snapshot.val().activity;
    const team = snapshot.val().team;

    const teamRef = firebase.database().ref('teams/' + (team - 1));

    teamRef.once('value', function (snapshot) {
      let points = snapshot.val().points;
      let pointsNew;

      // Check if multiple category is active
      if (activityList[activity].categories.includes("2")) {

        // Points
        pointsNew = Number(activityList[activity].points)

        // Get input from user
        pointsNew = prompt("Como a pontuação dessa atividade varia de acordo com o envio, escolha a pontuação para dar.\n\nEsta atividade vale " + activityList[activity].points + " " + activityList[activity].pointsDesc, "");
        if (pointsNew == null) {
          return;
        }

      } else {
        pointsNew = Number(activityList[activity].points);
      }

      // Add points

      teamRef.update({
        points: Number(points) + Number(pointsNew)
      });

      // Mark task as done on team

      const teamActivity = firebase.database().ref('teams/' + (team - 1) + '/tasks/' + activity);

      teamActivity.update({
        done: true,
        time: Date.now()
      });
    });
  });


  // Move record to approved
  const oldRef = firebase.database().ref('review/' + reference);
  const newRef = firebase.database().ref('approved/' + reference);

  moveFbRecord(oldRef, newRef);

  // Change card color
  document.getElementById(reference).style.backgroundColor = "#dff0d8";

  // Remove buttons
  document.getElementById("buttons+" + reference).innerHTML = "";
}

// Reject review

function reject(reference) {

  // Move record to rejected
  const oldRef = firebase.database().ref('review/' + reference);
  const newRef = firebase.database().ref('rejected/' + reference);

  moveFbRecord(oldRef, newRef);

  // Add reason to rejected record
  newRef.update({
    reason: prompt("Por favor, digite o motivo do rejeição:", "")
  });

  // Change card color
  document.getElementById(reference).style.backgroundColor = "#f2dede";

  // Remove buttons
  document.getElementById("buttons+" + reference).innerHTML = "";

}

function moveFbRecord(oldRef, newRef) {
  oldRef.once('value', function (snap) {
    newRef.update(snap.val(), function (error) {
      if (!error) {
        oldRef.remove();
      } else if (typeof (console) !== 'undefined' && console.error) {
        console.error(error);
      }
    });
  });

  // Set saved date
  firebase.database().ref('last_updated').update({
    date: Date.now()
  });
}

// Default Code

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

  var inflateState = true;

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

      if (inflateState) {
        inflateInterface();
        inflateState = false;
      }

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
        menuHolder.className = "";
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

function openModal() {
  document.getElementById('myModal').style.display = "block";
}

function urlify(text) {
  var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  //var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function(url,b,c) {
      var url2 = (c == 'www.') ?  'http://' +url : url;
      return '<a href="' +url2+ '" target="_blank">Link</a>';
  }) 
}