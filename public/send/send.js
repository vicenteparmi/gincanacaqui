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

// My code

var currentMode = null;
var itemSelected = -1;

fullList = false;

// Inflate list

var numberOnList = 1;

let activitiesList = [];

firebase.database().ref('activities/').once('value').then(function (snapshot) {

  snapshot.forEach(function (childSnapshot) {

    // Check if the activity is not of category 7 (entrega presencial)
    if (!childSnapshot.val().categories.includes("7")) {

      // Save info to activitiesList with key
      activitiesList[childSnapshot.key] = childSnapshot.val();

      // Create div for each activity
      const div = document.createElement('div');
      div.className = "bodyActItem";
      div.id = "ti" + childSnapshot.key;
      div.onclick = function () {
        sti(this.id)
      };

      // Title and points blocks
      const title = document.createElement('span');
      title.className = "title";
      title.innerHTML = numberOnList + ". " + childSnapshot.val().title;

      const points = document.createElement('span');
      points.className = "points";
      points.innerHTML = "+" + childSnapshot.val().points + " pontos " + childSnapshot.val().pointsDesc;

      // Add title and points to div
      div.appendChild(title);
      div.appendChild(points);

      // Add div to activityContainer
      const activityContainer = document.getElementById('activityContainer');
      activityContainer.appendChild(div);

      numberOnList++;
    }
  });
});

// Activity Selector

function sti(id) {

  // Clear error
  errorMessage.className = "hide";

  const mode0Holder = document.getElementById('sendOnePhoto');
  const mode1Holder = document.getElementById('sendMorePhotos');
  const mode2Holder = document.getElementById('sendVideo');
  const mode3Holder = document.getElementById('sendLink');

  mode0Holder.className = "hidden";
  mode1Holder.className = "hidden";
  mode2Holder.className = "hidden";
  mode3Holder.className = "hidden";

  const nothingSelected = document.getElementById('nothingSelected');
  nothingSelected.className = "hide";
  const somethingSelected = document.getElementById('somethingSelected');
  somethingSelected.className = "bodyItem";

  // Clear previous selection
  if (itemSelected != -1) {
    const previousSelection = document.getElementById('ti' + itemSelected);
    previousSelection.className = "bodyActItem";
  }

  // Set active class to div
  const div = document.getElementById(id);
  div.className = "bodyActItem active";

  // Remove first 3 characters from id
  itemSelected = id.substring(2);

  // Find info from activitiesList by key
  document.getElementById('activityName').innerHTML = activitiesList[itemSelected].title;

  // Set currentMode with category
  categories = activitiesList[itemSelected].categories;

  const taskAnswer = document.getElementById('taskAnswer');

  if (categories.includes("4")) {
    taskAnswer.className = "";
  } else {
    taskAnswer.className = "hidden";
  }

  if (categories.includes("3")) {
    currentMode = 0; // One pic mode
    mode0Holder.className = "";
  } else if (categories.includes("2")) {
    currentMode = 1; // More pics mode
    mode1Holder.className = "";
  } else if (categories.includes("6")) {
    currentMode = 2; // Video mode
    taskAnswer.className = '';
  } else if (categories.includes("4")) {
    console.log("Link modeee");
    currentMode = 3; // Link mode
    taskAnswer.className = '';
  }

  document.getElementById('description').innerHTML = activitiesList[itemSelected].description;
  document.getElementById('points').innerHTML = "+" + activitiesList[itemSelected].points + " pontos " + activitiesList[itemSelected].pointsDesc;

  // Clear fields
  document.getElementById('taskAnswer').value = "";
  document.getElementById('mode1input').value = "";

}

function helpVideo() {
  alert("Faça o upload do vídeo para algum serviço como Google Photos, YouTube ou Google Drive. Em seguida compartilhe o arquivo para obter o link. Em caso de mais dúvidas entre em contato na página 'sobre'.")
}


// Vars
let team;
let imageDownloadURL = [];

function send() {

  var imageId = [];

  var allOk = false;
  if (testforSend() == true) {
    allOk = true;
    errorMessage.className = "hide";
  } else {
    errorMessage.innerHTML = "Termine de preencher as informações antes de enviar.";
    errorMessage.className = "";
  }

  if (allOk == true) {

    // Check if the team has the activity
    firebase.database().ref('teams/' + (team - 1) + '/tasks/' + itemSelected).once('value').then(function (snapshot) {
      if (snapshot.val() == null || activitiesList[itemSelected].categories.includes("8")) {
        isInReview(team, itemSelected);
      } else {
        // If yes, warn the user
        errorMessage.innerHTML = "Essa atividade já foi aprovada para sua equipe.";
        errorMessage.className = "";
      }
    });
  }
}

function isInReview(team, activity) {
  // Verify if an activity in review matches the selected activity
  firebase.database().ref('review').once('value').then(function (snapshot) {

    let safe = true;

    // If there is a review
    snapshot.forEach(function (childSnapshot) {
      if ((childSnapshot.val().activity == activity && childSnapshot.val().team == team) && !activitiesList[itemSelected].categories.includes("8")) {
        errorMessage.innerHTML = "A atividade já foi enviada e está em revisão.";
        errorMessage.className = "";
        safe = false;
      }
    })

    // Check if there is any activity in review
    if (snapshot.numChildren() == 0 || snapshot.val() == null || safe == true) {
      proceed();
    }

  });
}

function proceed() {
  // Upload images if it is required by the activity
  if (currentMode == 0) { // One pic mode
    var image = document.getElementById('insertPicture');
    var style = image.currentStyle || window.getComputedStyle(image, false);
    var bi = style.backgroundImage.slice(4, -1).replace(/"/g, "");
    var file = dataURLtoFile(bi, "filename");
    storeImage('review/' + team + '/' + itemSelected + '/' + itemSelected + makeid(6), file[0], true);
    recordSendFB(itemSelected, team);

  } else if (currentMode == 1) { // More pics mode
    for (var i = 0; i < imagesUploaded; i++) {
      var image = document.getElementById('dpic/' + i);
      if (image) {
        var style = image.currentStyle || window.getComputedStyle(image, false);
        var bi = style.backgroundImage.slice(4, -1).replace(/"/g, "");
        var file = dataURLtoFile(bi, "filename");

        // Check if it's the last image
        let lastImage = false;
        if (i == imagesUploaded - 1) {
          lastImage = true;
        }

        storeImage('review/' + team + '/' + itemSelected + '/' + makeid(12), file[0], lastImage);
        recordSendFB(itemSelected, team);

      }
    }
  } else {
    sendToReview();
  }
}

function sendToReview() {

  const currentUser = firebase.auth().currentUser;

  let answer;

  if (document.getElementById('taskAnswerValue').value == "") {
    answer = document.getElementById('mode1input').value;
  } else {
    answer = document.getElementById('taskAnswerValue').value;
  }

  // Send record and then open modal
  firebase.database().ref('review/').push({
    team: team,
    userId: currentUser.uid,
    answer: answer,
    imageURLs: imageDownloadURL,
    activity: itemSelected
  }).then(function () {
    // Open modal
    document.getElementById('myModal').style.display = "block";
    document.getElementById('progressbar').className = ""
    document.getElementById('progressPercentage').style.width = "0%";
    document.getElementById('progressPercentage').style.width = "100%";
    document.getElementById('progressInd').innerHTML = "100%";
    document.getElementById('progressInd').style.color = "white";
    document.getElementById("sendingStatus").innerHTML = "Atividade enviada";
    const dbutton2 = document.getElementById('doneButton');
    dbutton2.className = "button3";
    dbutton2.onclick = function () {
      location.reload();
    };
  });
}

function recordSendFB(activity, team) {
  firebase.analytics().logEvent('send_activity', {
    activity: activity,
    team: team
  })
}

function testforSend() {
  var inputAnswer = document.getElementById('taskAnswerValue').value;
  if (activitiesList[itemSelected].categories.includes("4") || activitiesList[itemSelected].categories.includes("6")) {
    if (inputAnswer == "") {
      return false;
    }
  }


  switch (currentMode) {
    case 0: // One pic mode
      const image = document.getElementById('insertPicture');
      var style = image.currentStyle || window.getComputedStyle(image, false);
      var bi = style.backgroundImage.slice(4, -1).replace(/"/g, "");
      if (bi != "") {
        return true;
      } else {
        return false;
      }
      break;
    case 1: // Some pics mode
      if (imagesUploaded > 0) {
        return true;
      } else {
        return false;
      }
      break;
      // case 2: // Video
      //   const videoInput = document.getElementById('tas').value;
      //   if (videoInput != '') {
      //     return true;
      //   } else {
      //     return false;
      //   }
      //   break;
      // case 3: // URL
      //   const urlInput = document.getElementById('taskAnswerValue').value;
      //   if (urlInput != '') {
      //     return true;
      //   } else {
      //     return false;
      //   }
      //   break;
    default:
      return true;
  }
}

// Send to cloud

var imageToUpload;

function uploadImage(input) {
  if (input.files && input.files[0]) {
    // https://stackoverflow.com/a/44505315/6496084
    var fileSize = input.files[0].size / 1024 / 1024; // in MB
    if (fileSize > 10) {
      alert('A imagem selecionada é muito grande. ' +
        'Apenas imagens com menos de 10 MB são aceitas. ' +
        'E cara, não sei como vc consegiu uma imagem desse tamanho. ' +
        'Tá enviando em RAW só pode. ' +
        'Ah, e só dá pra enviar em PNG, JPG e TIFF (n sei quem usa esse último mas tá aí a opção).');
      location.reload();
    }

    var reader = new FileReader();

    reader.onload = function (e) {
      document.getElementById('insertPicture').style.backgroundImage = "url('" + e.target.result + "')";
      document.getElementById('cameraDiv').className = "afterUpload";
      document.getElementById('addText').innerHTML = "Alterar Imagem";

      imageToUpload = null;
      imageToUpload = dataURLtoFile(e.target.result, "profile.png");
    }

    reader.readAsDataURL(input.files[0]);
  }
}

$("#inputFile").change(function () {
  uploadImage(this);
});

var imagesUploaded = 0; // This variable is only useful to set a id to the items;

function uploadOneMoreImage(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      content = e.target.result;

      const span = document.getElementById('toUpload');
      const imageDiv = document.createElement('div');
      const closeButton = document.createElement('span');

      imageDiv.className = "smallPicture";
      imageDiv.style.backgroundImage = "url('" + content + "')";
      imageDiv.id = "dpic/" + imagesUploaded;

      closeButton.className = "closeSmallPic";
      closeButton.innerHTML = "&times";
      closeButton.id = "spic/" + imagesUploaded;
      closeButton.onclick = function () {
        closeSmallPic(this.id);
      };

      imageDiv.appendChild(closeButton);
      span.appendChild(imageDiv);

      imagesUploaded++;
    };

    reader.readAsDataURL(input.files[0]);
  }
}

$("#inputFile2").change(function () {
  uploadOneMoreImage(this);
});

function closeSmallPic(id) {

  var data = id.split("/");
  var id = Number(data[1]);

  const span = document.getElementById('toUpload');
  const child = document.getElementById('dpic/' + id);
  span.removeChild(child);
}

function storeImage(path, img, isLast) {
  document.getElementById('myModal').style.display = "block";
  const progressBar = document.getElementById('progressbar');
  const progressPercentage = document.getElementById('progressPercentage');
  const progressInd = document.getElementById('progressInd');
  progressBar.className = "";

  document.getElementById('sendingStatus').innerHTML = "Carregando imagem...";

  const promises = [];

  const uploadTask = firebase.storage().ref(path).put(img);
  promises.push(uploadTask);
  openModal();

  uploadTask.on('state_changed', snapshot => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log(progress);
    progressPercentage.style.width = progress + "%";
    progressInd.innerHTML = Math.round(progress, 2) + "%";

    if (progress > 50) {
      progressInd.style.color = "white";
    }

  }, error => {
    console.log(error)
  }, () => {
    uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
      console.log(downloadURL);
    });
  });

  Promise.all(promises).then(tasks => {
    console.log('File uploaded');

    // Get downloadURL to variable
    const imageRef = firebase.storage().ref(path);
    imageRef.getDownloadURL().then(function (url) {
      console.log(url);
      imageDownloadURL.push(url);

      if (isLast) {
        document.getElementById("sendingStatus").innerHTML = "Salvando atividade...";
        sendToReview();
      }
    });
  });
}

var extension;

function dataURLtoFile(dataurl, filename) {

  console.log(dataurl.charAt(11));
  switch (dataurl.charAt(11)) {
    case 'p':
      extension = ".png";
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
  return [new File([u8arr], filename, {
    type: mime
  }), extension];
}

// Verify account

function verifyAccount() {
  var user = firebase.auth().currentUser;
  firebase.auth().languageCode = 'pt';
  user.sendEmailVerification().then(function () {
    alert('Email enviado, abra sua caixa de entrada para continuar.');
  }).catch(function (error) {
    alert('Não foi possível enviar um email para a verificação. Código de erro: ' + error);
  });
}

// Make ID

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
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
  const loadMessage = document.getElementById("loading");
  const errorUser = document.getElementById("noUser");
  const errorTeam = document.getElementById("noTeam");
  const errorNone = document.getElementById("body");

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

      errorNone.className = "";

      // Get the team
      const currentUser = firebase.auth().currentUser;
      var dbRef = firebase.database().ref('users/' + currentUser.uid + "/team");
      dbRef.on('value', function (snapshot) {
        team = snapshot.val();
        if (team == null) {
          errorTeam.className = "";
          errorNone.className = "hidden";
        }
      });

      // Test for verification (I think it's working)

      if (emailVerified != true) {
        document.getElementById('noVer').className = '';
        errorNone.className = "hidden";
      }

    } else {
      errorUser.className = "";
    }
    loadMessage.className = "hidden";
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

// Modal popup
const modal = document.getElementById("myModal");

function openModal() {
  modal.style.display = "block";
}

// Send turned off

firebase.database().ref('settings').once('value').then(function (snap) {
  if (snap.val().allow_send != true) {
    document.getElementById('mySecondModal').style.display = 'block';
  }
})