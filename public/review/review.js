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

// Now my code ;D

// Get all images

var storageRef = firebase.storage().ref().child('review');
const teamNames = ["Hidrogênio","Hélio","Lítio","Berílio","Boro","Carbono","Nitrogênio","Oxigênio","Flúor","Neônio","Sódio","Magnésio","Alumínio","Silício","Fósforo","Enxofre"];
const teamColors = ["#005c8d","#c43030","#d1ad1e","#00b661","#94007e","#4d4d4d","#e7660b","#00b87e","#e91e63","#009ae6","#9e9c00","#00a89b","#a9a9a9","#172c88","#653c32","#01be87"];

// Inflate interface

function inflateInterface() {
  const listHolder = document.getElementById('activitiesHolder');
  var state = 1
  for (var i = 0; i < activityList.length; i++) {
    if (activityList[i]) {
      const title = document.createElement('h3');
      title.innerHTML = state + ". " + activityList[i];
      const reviewBox = document.createElement('span');
      reviewBox.id = "review" + (i+1);
      reviewBox.className = "reviewBox";
      listHolder.appendChild(title);
      listHolder.appendChild(reviewBox);
      state++;
    }
  }
}

// Getting posts from activity 1 and videos

var db1Ref = firebase.database().ref('review/Activity 1');
db1Ref.on('child_added', function(data) {
  var postKey = data.key;
  var postURL = data.val().url;
  var postUser = data.val().sentBy;
  var postDate = data.val().sentOn;
  var team = data.val().team;

  populateURL(postKey, postURL, postUser, postDate, team, 1);
});

var db2Ref = firebase.database().ref('review/Activity 6');
db2Ref.on('child_added', function(data) {
  var postKey = data.key;
  var postURL = data.val().url;
  var postUser = data.val().sentBy;
  var postDate = data.val().sentOn;
  var team = data.val().team;

  populateURL(postKey, postURL, postUser, postDate, team, 6);
});

var db3Ref = firebase.database().ref('review/Activity 18');
db3Ref.on('child_added', function(data) {
  var postKey = data.key;
  var postURL = data.val().url;
  var postUser = data.val().sentBy;
  var postDate = data.val().sentOn;
  var team = data.val().team;

  populateURL(postKey, postURL, postUser, postDate, team, 18);
});

function populateURL(postKey, postURL, postUser, postDate, team, activity) {
  const span = document.getElementById('review'+activity);
  const div = document.createElement('div');
  const text = document.createElement('p');
  const link = document.createElement('a');

  link.href = postURL;
  link.innerHTML = postURL;
  text.innerHTML = "URL: "
  text.appendChild(link);
  text.innerHTML += "<br/>Equipe: "+teamNames[team-1]+" | Usuário: "+postUser+" | Data: "+Date(postDate)+"<br/>";
  text.innerHTML += "<a id='a/"+team+"/"+postKey+"/"+activity+"' onclick='validateURL(true, this.id, "+activity+")' href='#'>Aceitar</a> | ";
  text.innerHTML += "<a id='a/"+team+"/"+postKey+"/"+activity+"' onclick='validateURL(false, this.id, "+activity+")' href='#'>Recusar</a>";
  div.appendChild(text);
  div.id = "d/"+team+"/"+postKey+"/"+activity;

  span.appendChild(div);
}

function validateURL(status, id, activity) {
  var data = id.split("/");
  var oldRef = firebase.database().ref("review/Activity "+activity+"/"+data[2]);
  var newRef = firebase.database().ref("approved/Activity "+activity+"/"+data[2]);
  if (status == true) {
    moveFbRecord(oldRef, newRef); // Move activity location
    var teamRef = firebase.database().ref('teams/'+(Number(data[1])-1));
    teamRef.transaction(function(tra) { // Update team punctuation
      if (tra) {
        if (tra.points) {
          tra.points += points[(activity-1)];
        } else {
          tra.points += points[(activity-1)];
          if (!tra.points) {
            tra.points += points[(activity-1)];
          }
        }
      }
      return tra;
    });

    update();
    sendAnal(activity, "Approved");

  } else {
    newRef = firebase.database().ref("rejected/Activity "+activity+"/"+data[2]);
    moveFbRecord(oldRef, newRef);
    sendAnal(activity, "Rejected");
  }
  document.getElementById('d/'+data[1]+'/'+data[2]+'/'+data[3]).style.display = "none";
}

function markAsDone(mode) {
  const masdTeam = document.getElementById('masdTeam');
  const masdActivity = document.getElementById('masdActivity');

  var theTeam = Number(masdTeam.value) - 1;
  var theActivity = Number(masdActivity.value);

  if (theTeam >= 1 && theActivity >= 1) {
    if (mode == 0) {
      firebase.database().ref('teams/'+theTeam+"/tasks/"+theActivity).set({
        done: "Ok",
        time: Date.now()
      });
      update();
      sendAnal(theActivity, "Approved");
    } else {
      firebase.database().ref('teams/'+theTeam+"/tasks/"+theActivity).remove();
      sendAnal(theActivity, "Rejected");
    }
    alert('Atividade atualizada.');
  } else {
    alert('Preencha os campos ao lado antes de enviar.');
  }
}

function moveFbRecord(oldRef, newRef) {
     oldRef.once('value', function(snap)  {
          newRef.set( snap.val(), function(error) {
               if( !error ) {  oldRef.remove(); }
               else if( typeof(console) !== 'undefined' && console.error ) {  console.error(error); }
          });
     });
}

// Posts from activities with more pictures;

const listRef = firebase.storage().ref('review'); // Review path

for (var i = 0; i <= 16; i++) { // To select the team folder
  listRefNow = listRef.child(i.toString());
  listRefNow.listAll().then(function(res) { // List all contents on team folder
    res.prefixes.forEach(function(folderRef) { // List folders on team folder
      folderRef.listAll().then(function(res1) { // Open folder on team folder
        res1.items.forEach(function(itemRef) { // Do something to each item
          itemRef.getDownloadURL().then(function(url) {

            var urlValues = url.toString().split('%2F');
            teamName = Number(urlValues[1])-1;
            activity = Number(urlValues[2]);
            imageName = getImageName(itemRef);

            const activityHolder = document.getElementById('review'+activity);

            const listItem = document.createElement('div');
            const listItemDescription = document.createElement('p');

            listItem.style.backgroundColor = teamColors[teamName];
            listItem.style.backgroundImage = "url('"+url+"')";
            listItem.className = "imageToReview";

            listItemDescription.innerHTML = "Equipe: " + teamNames[teamName];
            listItemDescription.className = "listItemDescription";
            listItemDescription.id = "p/"+teamName+"/"+activity+"/"+imageName;

            listItem.id = url+"<->"+activity+"<->"+teamName+"<->"+imageName;
            listItem.onclick = function() {inflateReview(this.id)};

            listItem.appendChild(listItemDescription);
            activityHolder.appendChild(listItem);
          }).catch(function(error) {
            console.log(error);
          });
        })
      })
    });
  }).catch(function(error) {
    console.log(error);
  });
}

function inflateReview(id) {
  const data = id.split('<->'); // url, activity, teamName, imageName

  document.getElementById('reviewImage').src = data[0];
  document.getElementById('md-actnum').innerHTML = "Atividade "+ data[1];
  document.getElementById('md-actdesc').innerHTML = descriptions[data[1]-1];

  var hasntWorked = true;
  for (var i = 0; i <= 28; i++) {
    if (data[1] == somePicsMode[i]) {
      firebase.database().ref('review/Activity '+data[1]+'/'+(Number(data[2])+1)+'/'+data[3].substring(0, data[3].length - 4)).once('value').then(function(snapshot) {
        inflateMoreInfo(snapshot);
      });
      hasntWorked = false;
    }
  }

  if (hasntWorked) {
    firebase.database().ref('review/Activity '+data[1]+'/'+(Number(data[2])+1)).once('value').then(function(snapshot) {
      inflateMoreInfo(snapshot);
    });
  }

  // Make the buttons 'clickable'

  const buttonA = document.getElementById('md-aprove');
  const buttonR = document.getElementById('md-reject');
  const buttonC = document.getElementById('md-cancel');

  buttonA.name = id;
  buttonR.name = id;

  buttonA.onclick = function() {accept(this.name)};
  buttonR.onclick = function() {reject(this.name)};
  buttonC.onclick = function() {document.getElementById('myModal').style.display = 'none';};

  openModal();
}

const sentData = document.getElementById('sentData');
sentData.innerHTML = "";
const dataToFill = document.createElement('p');

function inflateMoreInfo(snapshot) {
  var userNameReview = snapshot.val().sentBy;
  var userEmailReview = snapshot.val().email;
  var sentOnDate = snapshot.val().sentOn;
  var answer = snapshot.val().number;

  dataToFill.innerHTML = "Nome do usuário: "+userNameReview+"<br/>";
  dataToFill.innerHTML += "Email: "+userEmailReview+"<br/>";

  if (answer != null) {
    dataToFill.innerHTML += "Resposta: " + answer +"<br/>";
  } else {
    dataToFill.innerHTML += "Resposta: Não é necessária<br/>";
  }

  dataToFill.innerHTML += "Data do envio: " + new Date(sentOnDate);

  sentData.appendChild(dataToFill);
}

function getActivity(url) {
  var charAt87 = Number(url.charAt(87)).toString();
  if (charAt87 != "NaN") {
    var answer = url.charAt(86) + url.charAt(87);
    return Number(answer);
  } else {
    return Number(url.charAt(86));
  }
}

function getImageName(itemRef) {
  var imageName = itemRef.toString().slice(-24);
  var split = imageName.split('/');
  if (split.length > 1) {
    imageName = split[split.length - 1];
  }
  return imageName;
}

function accept(id) {
  var teamActivity = id.split('<->');  // url, activity, teamName, imageName
  teamActivity[2] = Number(teamActivity[2]);
  teamActivity[2]++; // Be careful, this might not be useful;

  const oldRef001 = 'review/'+teamActivity[2]+"/"+teamActivity[1]+"/"+teamActivity[3];
  const newRef001 = 'approved/'+teamActivity[2]+"/"+teamActivity[1]+"/"+teamActivity[3];

  // Remove file from storage
  var storageRef = firebase.storage().ref('review/'+teamActivity[2]+"/"+teamActivity[1]+"/"+teamActivity[3]);
  deleteFile("review/"+teamActivity[2]+"/"+teamActivity[1]+"/"+teamActivity[3]);

  // Update points
  var teamRef = firebase.database().ref('teams/'+(Number(teamActivity[2])-1)+'/points');
  teamRef.transaction(function (current_value) {
    return (current_value || 0) + points[(Number(teamActivity[1])-1)];
  });

  // Move database records
  var oldRef000;
  var newRef000;

  for (var i = 0; i <= 28; i++) {
    if (teamActivity[1] == somePicsMode[i]) {
      oldRef000 = firebase.database().ref('review/Activity '+teamActivity[1]+'/'+teamActivity[2]+'/'+teamActivity[3].substring(0, teamActivity[3].length - 4));
      newRef000 = firebase.database().ref('approved/Activity '+teamActivity[1]+'/'+teamActivity[2]).push();
      break;
    } else {
      oldRef000 = firebase.database().ref('review/Activity '+teamActivity[1]+'/'+teamActivity[2]);
      newRef000 = firebase.database().ref('approved/Activity '+teamActivity[1]+'/'+teamActivity[2]);
    }
  }
  moveFbRecord(oldRef000, newRef000);

  // The following code must be used only when one photo is submitted
  for (var i = 0; i < onePicMode.length; i++) {
    if (teamActivity[1] == onePicMode[i]) {
      firebase.database().ref('teams/'+(Number(teamActivity[2])-1)+"/tasks/"+teamActivity[1]).set({
        done: "Ok",
        time: Date.now()
      });
    }
  }

  document.getElementById(id).style.display = "none";
  document.getElementById('myModal').style.display = 'none';
  update();
  sendAnal(teamActivity[1], "Approved");
}

function reject(id) {
  var teamActivity = id.split('<->'); // [team/activity/filename] // url, activity, teamName, imageName
  teamActivity[2] = Number(teamActivity[2]);
  teamActivity[2]++;
  const storageRef = 'review/'+teamActivity[2]+"/"+teamActivity[1]+"/"+teamActivity[3];
  deleteFile(storageRef);

  // Get Reasons;
  var reasons = getReasons();

  // Move database records
  var oldRef000 = firebase.database().ref('review/Activity '+teamActivity[1]+'/'+teamActivity[2]);
  var newRef000 = firebase.database().ref('rejected/Activity '+teamActivity[1]).push();

  // Push reasons
  oldRef000.update({reasons: reasons});
  moveFbRecord(oldRef000, newRef000);

  document.getElementById(id).style.display = "none";

  document.getElementById('myModal').style.display = 'none';
  update();
  sendAnal(teamActivity, "Rejected");
}

const reasonsDesc = ["Integrante da equipe não aparece","Crachá da equipe não visível","Local de realização da atividade incorreto","Resposta da atividade incorreta"];

function getReasons() {
  var reasons = "";
  for (var i = 0; i <= 3; i++) {
    const checkbox = document.getElementById('problem'+i).checked;
    if (checkbox == true) {
      reasons += reasonsDesc[i];
      reasons += "/";
    }
  }
  for (var i = 4; i <= 5; i++) {
    const checkbox = document.getElementById('problem'+i).checked;
    if (checkbox == true) {
      reasons += document.getElementById('expl'+i).value;
      reasons += "/";
    }
  }

  return reasons;
}

function deleteFile(refURL) {
  var ref = firebase.storage().ref(refURL);

  ref.delete().then(function() {
  console.log("File deleted successfully!");
  }).catch(function(error) {
    console.log("Uh-oh, an error occurred! Error: "+error);
  });
}

function update() {
  firebase.database().ref('last_updated').set({
  date: Date.now()
  });
}

function sendAnal(activity, status) {
  firebase.analytics().logEvent('activity_reviewed', {
    activity: activity,
    status: status,
  })
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

  var inflateState = true;

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

      if (inflateState) {
        inflateInterface();
        inflateState = false;
      }

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

function openModal() {
  document.getElementById('myModal').style.display = "block";
}
