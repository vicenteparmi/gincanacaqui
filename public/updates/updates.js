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

// Sync points

var fbRef = firebase.database().ref('teams');

fbRef.on('child_added', function(sn) {
  document.getElementById('points'+(Number(sn.key)+1)).innerHTML = sn.val().points;
});

// Build lists

function buildLists() {
  for (var i = 1; i <= 16; i++) {
    const listHolder = document.getElementById('activityList'+i);

    const list = document.createElement('ul');
    const title = document.createElement('h3');

    title.innerHTML = 'Atividades concluídas:';
    title.style.margin = '0px 0px 0px 1vw';
    listHolder.appendChild(title);

    for (var i2 = 0; i2 < activityList.length; i2++) {
      if (activityList[i2] != null) {
        const listItem = document.createElement('li');
        listItem.innerHTML = activityList[i2];
        listItem.id = 'li/'+i+'/'+i2;
        listItem.style.display = 'none';
        list.appendChild(listItem);
      }
    }

    const noActivityError = document.createElement('p');
    noActivityError.innerHTML = "Esta equipe ainda não concluiu nenhuma atividade do site.";
    noActivityError.id = 'noActivityError'+i;
    noActivityError.style.margin = '1vw';

    listHolder.appendChild(list);
    listHolder.appendChild(noActivityError);
    listHolder.className = 'listHolder';
  }
}
buildLists();

// Members

var fbRef1 = firebase.database().ref('users');

fbRef1.on('child_added', function(snapshot) {
  var displayName = snapshot.val().name;
  var userTeam = snapshot.val().team;
  buildMembers(displayName, userTeam);
});

var ggEasy = [];
function buildMembers(user, team) {
  const listHolder = document.getElementById('activityList'+team);


  if (!ggEasy.includes(team)) {
  const title = document.createElement('h3');
  title.innerHTML = 'Componentes:';
  title.style.margin = '20px 0px 0px 1vw';
  listHolder.appendChild(title);
  ggEasy.push(team);
  }

  const componentsHolder = document.createElement('ul');
  const listItem = document.createElement('li');
  listItem.innerHTML = user;
  componentsHolder.appendChild(listItem);

  listHolder.appendChild(componentsHolder);
}

// Remove pending activities

const fbRef2 = firebase.database().ref('teams');
fbRef2.on('child_added', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
        if (childSnapshot.key == 'tasks') {
          childSnapshot.forEach(function(scSnap) {
            var activity = scSnap.val().done;
            var aNumber = (scSnap.key-1).toString();
            var teamNumber = (Number(snapshot.key)+1);

            if (activity == 'Ok') {
              document.getElementById('li/'+teamNumber+'/'+aNumber).style.display = 'list-item';
              document.getElementById('noActivityError'+teamNumber).style.display = 'none';
            }
          });
        };
    });
});

// Header shadow

headerShadow();
function headerShadow() {
	if (document.body.scrollTop == 0 || document.documentElement.scrollTop == 0){
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

    window.onclick = function() {
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

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      name = user.displayName;
      email = user.email;
      photoUrl = user.photoURL;
      emailVerified = user.emailVerified;
      uid = user.uid;

      document.getElementById('userName').innerHTML = name;
      document.getElementById('userEmail').innerHTML = email;
      document.getElementById("userPhoto").style.backgroundImage = "url('"+photoUrl+"')";
    }
  });
}

function signOut() {
  firebase.auth().signOut().then(function() {
    console.log('Signed Out');
    location.reload();
  }, function(error) {
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
    window.onclick = function() {
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
