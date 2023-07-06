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

// Constants

const teamNames = ["Hidrogênio", "Hélio", "Lítio", "Berílio", "Boro", "Carbono", "Nitrogênio", "Oxigênio", "Flúor", "Neônio", "Sódio", "Magnésio", "Alumínio", "Silício", "Fósforo", "Enxofre"];

// Load Teams
var fbTeamData = [
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  []
];

function loadLeaderborad() {

  var fbRef = firebase.database().ref('teams');
  fbRef.on('child_added', function (snapshot) {
    var tn = snapshot.key;
    fbTeamData[tn][1] = snapshot.val().name;
    fbTeamData[tn][0] = snapshot.val().points;
    fbTeamData[tn][2] = tn;
    fbTeamData[tn][0] = fbTeamData[tn][0].toString().padStart(6, "0");
  });
  fbRef.on('child_changed', function (snapshot) {
    var tn = snapshot.key;
    fbTeamData[tn][1] = snapshot.val().name;
    fbTeamData[tn][0] = snapshot.val().points;
    fbTeamData[tn][2] = tn;
    fbTeamData[tn][0] = fbTeamData[tn][0].toString().padStart(6, "0");

    updateLB();
  });

  // Display loaded data
  firebase.database().ref('/teams/15').once('value').then(function (snapshot) {
    inflateLB();
    inflateACT();
  });
}

function inflateLB() {
  var lbOrder = [...fbTeamData];
  lbOrder.sort().reverse();

  document.getElementById('splashHolder').className += 'hideSplash';

  // Leaderboard podium

  for (var i = 1; i < 4; i++) {
    document.getElementById('podiumImage' + i).style.backgroundImage = "url('files/teams/" + (Number(lbOrder[i - 1][2]) + 1) + ".webp')";
    document.getElementById('teamName' + i).innerHTML = lbOrder[i - 1][1];
    document.getElementById('teamPoints' + i).innerHTML = lbOrder[i - 1][0].replace(/^0+/, '') + " pontos";

    if (lbOrder[i - 1][0] == '000000') {
      document.getElementById('teamPoints' + i).innerHTML = "0 pontos";
    }

    document.getElementById('p' + i).className = 'podium loaded p' + i;
  }

  // Leaderboard list
  for (var i = 3; i < lbOrder.length; i++) {
    inflateLBChild(lbOrder, i);
  }
}

function inflateLBChild(lbOrder2, child) { // Arguments: [OrderedArray, Position]
  const lbHolder = document.getElementById('podiumHolder');
  const lbDiv = document.createElement('div');
  const spanName = document.createElement('span');
  const spanPoints = document.createElement('span');
  const spanPosition = document.createElement('span');

  lbDiv.className = 'leaderBoard center pos' + child;
  spanName.innerHTML = lbOrder2[child][1];
  spanPoints.innerHTML = lbOrder2[child][0].replace(/^0+/, '') + " pontos";
  spanPosition.innerHTML = (child + 1) + 'º';

  if (lbOrder2[child][0] == '000000') {
    spanPoints.innerHTML = "0 pontos";
  }

  lbDiv.id = 'lbd' + lbOrder2[child][2];
  spanPoints.id = 'lbsp' + lbOrder2[child][2];
  spanPosition.id = 'lbspos' + lbOrder2[child][2];

  spanName.className = 'teamNameList';
  spanPoints.className = 'teamPointsList';
  spanPosition.className = 'position';

  lbDiv.appendChild(spanPosition);
  lbDiv.appendChild(spanName);
  lbDiv.appendChild(spanPoints);

  lbHolder.appendChild(lbDiv);
}

function updateLB() {
  var lbOrder = [...fbTeamData];
  lbOrder.sort().reverse();

  for (var i = 0; i < fbTeamData.length; i++) { // Changing the team
    for (var i2 = 0; i2 < fbTeamData.length; i2++) { // Change the position
      if (fbTeamData[i][2] == lbOrder[i2][2]) {
        if (i2 <= 2) {
          document.getElementById('podiumImage' + (i2 + 1)).style.backgroundImage = "url('files/teams/" + (Number(lbOrder[i2][2]) + 1) + ".webp')";
          document.getElementById('teamName' + (i2 + 1)).innerHTML = lbOrder[i2][1];
          document.getElementById('teamPoints' + (i2 + 1)).innerHTML = lbOrder[i2][0].replace(/^0+/, '') + " pontos";

          if (lbOrder[i2][0] == '000000') {
            document.getElementById('teamPoints' + (i2 + 1)).innerHTML = "0 pontos";
          }

          try {
            document.getElementById('lbd' + i).remove();
          } catch (e) {
            continue;
          }
        } else {
          try {
            const div = document.getElementById('lbd' + i);
            div.className = 'leaderBoard center pos' + i2;
            const spoints = document.getElementById('lbsp' + i);
            spoints.innerHTML = lbOrder[i2][0].replace(/^0+/, '') + " pontos";

            if (lbOrder[i2][0] == '000000') {
              spoints.innerHTML = "0 pontos";
            }

            const spos = document.getElementById('lbspos' + i);
            spos.innerHTML = (i2 + 1) + 'º';
          } catch (e) {
            inflateLBChild(lbOrder, i2);
          } finally {

          }
        }

      }
    }
  }
}

// Last updated message;

firebase.database().ref('last_updated/date').on('value', function (snaps) {
  document.getElementById('lastUpdatedHolder').className = "lastUpdatedClass center";
  var d = new Date(snaps.val());
  const spanDate = document.getElementById('lastUpdated');
  spanDate.innerHTML = handleDate(d);
});

// Inflate activities

function inflateACT() {
  document.getElementById('activities').style.display = 'block';
  var stage = 1;

  // Get holder
  const actListHolder = document.getElementById('activities');

  // Build cards from activity database
  firebase.database().ref('/activities').once('value').then(function (snap) {
    snap.forEach(function (act) {
      // Create Elements
      const card = document.createElement('div');
      const title = document.createElement('h2');
      const description = document.createElement('p');
      const img = document.createElement('img');
      const actNumber = document.createElement('span');
      const pointsAct = document.createElement('span');

      // Infobox
      const infobox = document.createElement('div');
      const photoNumber = document.createElement('div');
      const sendOn = document.createElement('div');
      const needAnswer = document.createElement('div');
      const veteran = document.createElement('div');

      // Set classes
      card.className = 'actCards';
      title.className = 'actTitle';
      description.className = 'actDesc';
      img.className = 'actIcon';
      actNumber.className = 'actNumber';
      pointsAct.className = 'points'

      // Add information
      title.innerHTML = act.val().title;
      description.innerHTML = act.val().description;
      img.src = act.val().image;
      actNumber.innerHTML = stage;
      pointsAct.innerHTML = "+" + act.val().points + " " + act.val().pointsDesc;
      stage++;

      // Setup Infobox
      infobox.className = 'infobox';
      photoNumber.className = 'chips';
      sendOn.className = 'chips';
      needAnswer.className = 'chips';
      veteran.className = 'chips';

      // Inflate infobox;

      // Pictures to send;
      if (act.val().categories.includes("3")) {
        photoNumber.innerHTML = "<img src='files/image/onePicMode.svg' class='chipimg'/>Uma imagem";
        photoNumber.style.backgroundColor = '#673ab7';
      } else if (act.val().categories.includes("2")) {
        photoNumber.innerHTML = "<img src='files/image/somePicsMode.svg' class='chipimg'/>Várias imagens";
        photoNumber.style.backgroundColor = '#e91e63';
      } else if (act.val().categories.includes("6")) {
        photoNumber.innerHTML = "<img src='files/image/videoMode.svg' class='chipimg'/>Vídeo";
        photoNumber.style.backgroundColor = '#f44336';
      } else {
        photoNumber.style.display = 'none';
      }

      // Places to send
      if (act.val().categories.includes("7")) {
        sendOn.innerHTML = "<img src='files/image/noWebsite.svg' class='chipimg'/>Entrega presencial";
        sendOn.style.backgroundColor = '#0097a7';
      } else if (act.val().categories.includes("1")) {
        sendOn.innerHTML = "<img src='files/image/websiteMode.svg' class='chipimg'/>Envio pelo site";
        sendOn.style.backgroundColor = '#ff9800';
      }

      // Need answers
      if (act.val().categories.includes("4")) {
        needAnswer.innerHTML = "<img src='files/image/answerNeeded.svg' class='chipimg'/>Precisa de resposta";
        needAnswer.style.backgroundColor = '#009688';
      } else {
        needAnswer.style.display = 'none';
      }

      // Veteran needed
      if (act.val().categories.includes("5")) {
        veteran.innerHTML = "<img src='files/image/veteran.svg' class='chipimg'/>Veterano necessário";
        veteran.style.backgroundColor = '#4caf50';
      } else {
        veteran.style.display = 'none';
      }

      // Append elements
      card.appendChild(actNumber);
      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(pointsAct);
      card.appendChild(description);
      // Append infobox
      infobox.appendChild(photoNumber);
      infobox.appendChild(sendOn);
      infobox.appendChild(needAnswer);
      infobox.appendChild(veteran);
      card.appendChild(infobox);
      actListHolder.appendChild(card);

    });
  });
}

function handleDate(date) {
  var day = ("0" + date.getDate()).slice(-2);
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var year = date.getFullYear();
  var hours = date.getHours();
  var minutes = ("0" + date.getMinutes()).slice(-2);

  return day + "/" + month + "/" + year + " às " + hours + "h" + minutes;
}

// Posts

firebase.database().ref('posts').limitToLast(10).orderByKey().on('child_added', function (child) {
  document.getElementById('pubTitle').style.display = "block";
  const postsHolder = document.getElementById('posts');
  var postDiv = document.createElement('div');
  var postTitle = document.createElement('h2');
  var postContent = document.createElement('p');
  var postDate = document.createElement('p');

  postTitle.innerHTML = child.val().title;
  postContent.innerHTML = child.val().content;
  postDate.innerHTML = "Enviado em " + handleDate(new Date(child.val().date));

  postDiv.className = 'postCard';
  postTitle.className = 'postTitle';
  postDate.className = 'postDate';
  postContent.className = 'postContent';

  postDiv.appendChild(postTitle);
  postDiv.appendChild(postDate);
  postDiv.appendChild(postContent);

  postsHolder.appendChild(postDiv);

})

// Do we have a winner?

firebase.database().ref('settings').once('value').then(function (snapsw) {
  if (snapsw.val().we_have_a_winner == true) {
    confetti.start();
    document.getElementById('crown').className = 'loaded';
    setTimeout('stopConfetti()', 6000);
  }
})

function stopConfetti() {
  confetti.stop();
}

// Management menu
// Check if user can access management menu

firebase.database().ref('management').once('value').then(function (snap) {
  document.getElementById('superUserMenu').style.display = "block";
})

// Header shadow

function headerShadow() {
  if (document.body.scrollTop == 0 || document.documentElement.scrollTop == 0) {
    document.getElementById("header").className = "headerNoShadow";
  }
  if (document.body.scrollTop != 0 || document.documentElement.scrollTop != 0) {
    document.getElementById("header").className = "";
  }

  // Remove lag when canvasis out of the screen;
  if (elementInViewport2(document.getElementById('canvas'))) {
    activateInterval();
  } else {
    deactivateInterval();
  }
}
headerShadow();

function elementInViewport2(el) {
  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  while (el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return (
    top < (window.pageYOffset + window.innerHeight) &&
    left < (window.pageXOffset + window.innerWidth) &&
    (top + height) > window.pageYOffset &&
    (left + width) > window.pageXOffset
  );
}

// Default code

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