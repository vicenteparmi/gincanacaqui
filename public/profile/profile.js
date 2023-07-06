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

// teamSelector

function selectTeam(team) {

  user = firebase.auth().currentUser;
  const userId = user.uid

  if (team == 0) {
    openModal();
  } else {
    firebase.database().ref('users/' + userId).update({
      team: team,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL
    });

    modal.style.display = "none";
    setTeam(team);
  }

  firebase.analytics().setUserProperties({
    team: team
  });

}

// User stuff

var popupShow = false;
var signedIn = false;

// Get user information
var name;
var email;
var photoUrl;
var uid;
let globalTeam;

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    user.providerData.forEach(function (profile) {
      uid = profile.uid;
      email = profile.email;
      photoURL = user.photoURL;
      emailVerified = user.emailVerified;

      console.log(profile.photoURL);

      const currentUser1 = firebase.auth().currentUser;
      let userNameH;

      firebase.database().ref('users/' + currentUser1.uid).once('value').then(function (snapshot) {
        userNameH = snapshot.val().name;
      }).then(function () {

        if (userNameH == undefined) {
          userNameH = user.displayName;
        }

        document.getElementById('userName').innerHTML = userNameH;
      });



      document.getElementById('userEmail').innerHTML = email;
      document.getElementById("profileImage").style.backgroundImage = "url('" + photoURL + "')";

      // Get team
      var team;

      var dbRef = firebase.database().ref('users/' + currentUser1.uid + "/team");
      dbRef.on('value', function (snapshot) {
        team = snapshot.val();
        globalTeam = team;
        setTeam(team);

        // Load team members
        loadTeamMembers();

        // Display all activities
        firebase.database().ref('activities').once('value').then(function (snap) {
          snap.forEach(function (childSnapshot) {
            const title = childSnapshot.val().title;
            var activity = document.createElement("div");
            activity.className = "activity";
            activity.innerHTML = "<div class='activityTitle'>" + title + "</div>";
            activity.id = "act+" + childSnapshot.key;
            document.getElementById("activityList").appendChild(activity);
          });
        }).then(function () {
          // Mark done activities for the current team
          firebase.database().ref('teams/' + (team - 1) + '/tasks').once('value').then(function (snap) {
            snap.forEach(function (childSnapshot) {
              var activity = document.getElementById("act+" + childSnapshot.key);
              activity.className = "activity done";
            });
          })
        }).then(function () {
          firebase.database().ref('activities').once('value').then(function (snap) {
            snap.forEach(function (currentAct) {

              // Get activities in review for the current team
              firebase.database().ref('review').once('value').then(function (snapshot) {

                // If there is a review
                snapshot.forEach(function (childSnapshot2) {

                  if ((currentAct.key == childSnapshot2.val().activity && childSnapshot2.val().team == team)) {
                    var activity = document.getElementById("act+" + currentAct.key);
                    activity.className += " review";
                  }
                })
              });
            });
          });
        });

      });

      // Get verified

      if (emailVerified == true) {
        document.getElementById('verified').className = '';
      } else {
        document.getElementById('toVerify').className = '';
      }

    });

  } else {
    name = 'Anônimo';
    email = 'Usuário não conectado';
  }
});

// Set team

function setTeam(teamNumber) {

  firebase.analytics().setUserProperties({
    team: teamNumber
  });

  if (teamNumber != null) {
    let teamPropreties;

    firebase.database().ref('teams/' + (teamNumber - 1)).once('value').then(function (snapshot) {
      teamPropreties = {
        name: snapshot.val().name,
        color: snapshot.val().color,
        points: snapshot.val().points
      }
    }).then(function () {

      document.getElementById("hasTeam").className = "";
      document.getElementById("unknownTeam").className = "hide";
      document.getElementById("loadingTeam").className = "hide";
      document.getElementById("actLC").className = "";

      document.getElementById('teamName').innerHTML = teamPropreties.name;
      document.getElementById('body').style.backgroundColor = teamPropreties.color;

      document.getElementById("teamImage").style.backgroundImage = "url('./files/teams/" + teamNumber + ".webp')"
      //document.getElementById("teamCard").className = "card";

      document.getElementById('points').innerHTML = teamPropreties.points;

      firebase.analytics().setUserProperties({
        team: teamName
      });

    });
  } else {
    document.getElementById("unknownTeam").className = "";
    document.getElementById("loadingTeam").className = "hide";
  }
}

// Load team

function loadTeamMembers() {
  firebase.database().ref("users").once('value', function (snapshot) {

    // Clear team members
    document.getElementById("teamHolder").innerHTML = "";

    snapshot.forEach(function (childSnapshot) {

      // Check if is from the current team
      if (childSnapshot.val().team == globalTeam) {

        // Get user team placeholder
        let teamPlaceholder = document.getElementById("teamHolder");

        // Create user card
        let userCard = document.createElement('div');
        userCard.className = 'userCard';

        // Create user image
        let userImage = document.createElement('div');
        userImage.className = 'userImage';
        userImage.style.backgroundImage = "url('" + childSnapshot.val().photo + "')";

        // Create user name
        let userName = document.createElement('span');
        userName.className = 'userName';
        userName.innerHTML = childSnapshot.val().name;

        // Append user info to user card
        userCard.appendChild(userImage);
        userCard.appendChild(userName);

        // Append user card to team placeholder
        teamPlaceholder.appendChild(userCard);
      }
    });
  });
}

// Verify account

function verifyAccount() {
  var user = firebase.auth().currentUser;
  firebase.auth().languageCode = 'pt';
  user.sendEmailVerification().then(function () {
    alert('Email enviado, abra sua caixa de entrada para continuar.');
  }).catch(function (error) {
    console.log(error);
  });
}

// Sign out from profile

function signOut() {
  firebase.auth().signOut().then(function () {
    console.log('Signed Out');
    location.replace('./index.html');
  }, function (error) {
    console.error('Sign Out Error', error);
  });
}

// Update password

function changePassword() {
  var auth = firebase.auth();
  var emailAddress = prompt('Insira o email de sua conta abaixo. Enviaremos um link para redefinir sua senha.', '');

  if (emailAddress != null) {
    auth.sendPasswordResetEmail(emailAddress).then(function () {
      alert('Email enviado!');
    }).catch(function (error) {
      alert('Não foi possível enviar o email. Verifique suas informações e tente novamente.');
    });
  }
}

// Update userName

function updateUserName() {
  var user = firebase.auth().currentUser;
  var name = prompt("Qual o novo nome de usuário?", user.displayName);
  if ((name != null && name != "") && name.length <= 25) {
    if (user != null) {
      user.updateProfile({
        displayName: name,
      }).then(function () {
        document.getElementById("userName").innerHTML = name;
        firebase.database().ref('users/' + user.uid).update({
          name: name
        });
      }).catch(function (error) {
        console.log(error);
      });
    } else {
      console.log("Nenhum usuário conectado.");
    }
  } else if (name.length > 25) {
    alert("O nome que você escolheu é muito grande, tente usar até 25 caracteres.")
  } else {
    alert("Ocorreu um erro, tente novamente em alguns instantes.")
  }
}

// Upload profile picture

function uploadImage(input) {
  var user = firebase.auth().currentUser;
  if (input.files && input.files[0]) {
    // https://stackoverflow.com/a/44505315/6496084
    var fileSize = input.files[0].size / 1024 / 1024; // in MB
    if (fileSize > 10) {
      alert('A imagem selecionada é muito grande. ' +
        'Apenas imagens com menos de 5 MB são aceitas. ' +
        'E cara, não sei como vc consegiu uma imagem desse tamanho. ' +
        'Ah, e só dá pra enviar em PNG, JPG e TIFF.' +
        'O site vai até tentar enviar a foto, mas já te adianto que n vai salvar.');
    }

    var reader = new FileReader();

    reader.onload = function (e) {
      content = e.target.result; // this is the content!
      document.querySelector('#profileImage').style.backgroundImage = "url('" + content + "')";

      var imageToUpload = dataURLtoFile(content, "profile.webp");
      storeProfileImage("user_photos/" + user.uid + extension, imageToUpload);
    }

    reader.readAsDataURL(input.files[0]);
  }
}

$("#profilePicture").change(function () {
  uploadImage(this);
});

// Delete account

function deleteAccount() {
  let user = firebase.auth().currentUser;
  let userId = user.uid;
  let userIsSure = confirm('Você tem certeza que deseja apagar sua conta? Essa ação é irreversível.');
  if (userIsSure == true) {
    user.delete().then(function () {
      alert('Sua conta foi apagada com sucesso.');

      // Remove the user from the database
      firebase.database().ref('users/' + userId).remove().then(function () {
        console.log('User removed from database');
      }).catch(function (error) {
        console.log('User not removed from database');
      });

      location.replace('./index.html');
    }).catch(function (error) {
      alert('Não foi possível apagar a conta. Saia e faça login novamente.');
    });
  } else {
    alert('A conta não foi apagada.');
  }
}

// Profile picture handle

function storeProfileImage(path, img) {
  const progressBar = document.getElementById('progressbar');
  const progressPercentage = document.getElementById('progressPercentage');
  const progressInd = document.getElementById('progressInd');
  progressBar.className = "";

  const promises = [];

  const uploadTask = firebase.storage().ref(path).put(img);
  promises.push(uploadTask);

  uploadTask.on('state_changed', snapshot => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log(progress);
    progressPercentage.style.width = progress + "%";
    progressInd.innerHTML = "Enviando imagem (" + Math.round(progress, 2) + "%)"
  }, error => {
    console.log(error)
  }, () => {
    uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
      console.log(downloadURL);
    });
  });

  Promise.all(promises).then(tasks => {
    console.log('Updating URL...');
    updateProfileURL();
    progressBar.className = "hide";
  });
}

function updateProfileURL() {
  var user = firebase.auth().currentUser;
  var storage = firebase.storage();
  var gsReference = storage.refFromURL('gs://havarena-f3d87.appspot.com/user_photos/' + user.uid + extension);
  gsReference.getDownloadURL().then(function (url) {
    console.log(url);
    firebase.database().ref('users/' + user.uid).update({
      photo: url
    });
    user.updateProfile({
      photoURL: url
    }).then(function () {
      console.log("Sucesso");
    }).catch(function (error) {
      console.log("Fracasso");
    });
  }).catch(function (error) {
    console.log(error);
  });


}


var extension;

function dataURLtoFile(dataurl, filename) {

  console.log(dataurl.charAt(11));
  switch (dataurl.charAt(11)) {
    case 'p':
      extension = ".webp";
      break;
    case 'j':
      extension = ".jpg";
      break;
    case 't':
      extension = ".tiff";
    default:
      alert("O arquivo é inválido");
      uhsasuaUSIUSIUAH(hue);
  }

  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {
    type: mime
  });
}


// Modal popup
const modal = document.getElementById("myModal");

function openModal() {
  var span = document.getElementsByClassName("close")[0];

  modal.style.display = "block";

  span.onclick = function () {
    modal.style.display = "none";
  }

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
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

// Modal

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

// Build lists

function buildLists() {
  const listHolder = document.getElementById('activityList');

  const list = document.createElement('ul');
  list.style.margin = "16px";

  for (var i2 = 0; i2 < activityList.length; i2++) {
    if (activityList[i2] != null) {
      const listItem = document.createElement('li');
      listItem.innerHTML = activityList[i2];
      listItem.id = 'li/' + i2;
      list.appendChild(listItem);
    }
  }

  listHolder.appendChild(list);
  listHolder.className = 'listHolder';
}
buildLists();