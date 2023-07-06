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

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const auth = firebase.auth();

  const callback = auth.signInWithEmailAndPassword(email, password);
  callback.catch(e => console.log(e.message));
}

function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const auth = firebase.auth();

  const callback = auth.createUserWithEmailAndPassword(email, password);
  callback.catch(e => console.log(e.message));
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
