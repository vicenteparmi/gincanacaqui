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

const teamNames = ["Hidrogênio","Hélio","Lítio","Berílio","Boro","Carbono","Nitrogênio","Oxigênio","Flúor","Neônio","Sódio","Magnésio","Alumínio","Silício","Fósforo","Enxofre"];
var currentMode = null;
var itemSelected = -1;

fullList = false;

// Inflate list

const listHolder = document.getElementById('table');
const tbody = document.createElement('tbody');

var numberOnList = 1;

for (var i = 0; i < activityList.length; i++) {
  if (activityList[i]) {
    const tr = document.createElement('tr');
    tr.id = 'ti'+i;
    tr.onclick = function() {sti(this.id)};

    const titleList = document.createElement('td');
    const pointsList = document.createElement('td');

    titleList.innerHTML = numberOnList + '. ' +activityList[i];
    pointsList.innerHTML = "+" + getPoints(i, true); // (Activity number, with text description);
    pointsList.className = 'points';

    tr.appendChild(titleList);
    tr.appendChild(pointsList);
    tbody.appendChild(tr);

    numberOnList++;
  }
}

listHolder.appendChild(tbody);

// Activity Selector

function sti(id) {

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

  const scrollDiv = document.getElementById('scrollDiv');
  scrollDiv.className = "afterClick";

  try {
    document.getElementsByClassName('selected')[0].className = "";
  } finally {
    document.getElementById(id).className = "selected";
  }

  itemSelected = id.charAt(2) + id.charAt(3);
  itemSelected = Number(itemSelected)+1;

  document.getElementById('activityName').innerHTML = activityList[itemSelected-1];

  for (var i = 0; i < 28; i++) {
    if (itemSelected == onePicMode[i]) {
      currentMode = 0;
      mode0Holder.className = "";
      break;
    } else if (itemSelected == somePicsMode[i]) {
      currentMode = 1;
      mode1Holder.className = "";
      break;
    } else if (itemSelected == videoMode[i]) {
      currentMode = 2;
      mode2Holder.className = "";
      break;
    } else if (itemSelected == urlMode[i]) {
      currentMode = 3;
      mode3Holder.className = "";
      break;
    }
  }

  const taskAnswer = document.getElementById('taskAnswer');
  taskAnswer.className = 'hidden';

  for (var i = 0; i < 28; i++) {
    if (itemSelected == needsInput[i]) {
      taskAnswer.className = "";
    }
  }

  document.getElementById('description').innerHTML = descriptions[Number(itemSelected)-1];

  console.log("Current Mode: "+currentMode);
}

function helpVideo() {
  alert("Faça o upload do vídeo para algum serviço como Google Photos, YouTube ou Google Drive. Em seguida compartilhe o arquivo para obter o link. Em caso de mais dúvidas entre em contato na página 'sobre'.")
}

var team;

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
      const currentUser = firebase.auth().currentUser;
      switch (currentMode) {
        case 0: // One pic mode
          firebase.database().ref('teams/'+(team-1)+"/tasks/"+itemSelected).once('value').then(function(snapshot) {
            try {
              if (snapshot.val().done == "Ok") {
                alert("Esta atividade já foi aprovada. Faça o envio de uma atividade diferente.");
              }
            } catch (e) {
              var image = document.getElementById('insertPicture');
              var style = image.currentStyle || window.getComputedStyle(image, false);
              var bi = style.backgroundImage.slice(4, -1).replace(/"/g, "");
              var file = dataURLtoFile(bi, "filename");
              storeImage('review/'+team+'/'+itemSelected+'/'+itemSelected+file[1], file[0]);
              recordSendFB(itemSelected, team);
            } finally {
              // Nothing to do, I guess;
            }
          });
          break;
        case 1: // Some pics mode0Holder
          for (var i = 0; i < imagesUploaded; i++) {
            var image = document.getElementById('dpic/'+i);
            if (image) {
              var style = image.currentStyle || window.getComputedStyle(image, false);
              var bi = style.backgroundImage.slice(4, -1).replace(/"/g, "");
              var file = dataURLtoFile(bi, "filename");
              imageId[i] = firebase.database().ref('review/'+team+'/'+itemSelected).push();
              storeImage('review/'+team+'/'+itemSelected+'/'+imageId[i].key+file[1], file[0]);
              recordSendFB(itemSelected, team);
            }
          }
          break;
        case 2: // Video mode
          firebase.database().ref('teams/'+(team-1)+"/tasks/"+itemSelected).once('value').then(function(snapshot) {
            try {
              if (snapshot.val().done == "Ok") {
                alert("Esta atividade já foi aprovada. Faça o envio de uma atividade diferente.");
              }
            } catch (e) {
              const mode2input = document.getElementById('mode2input');
              if (itemSelected == 6 || itemSelected == 18) {
                var dbRef = firebase.database().ref("review/Activity "+itemSelected).push();
                dbRef.set({
                  team: team,
                  sentBy: currentUser.displayName,
                  sentOn: Date.now(),
                  url: mode2input.value
                })
                openModal();
                recordSendFB(itemSelected, team);
              }
              document.getElementById('progressbar').className = "";
              document.getElementById('progressPercentage').style.width = "100%";
              document.getElementById('progressInd').innerHTML = "100%";
              document.getElementById("sendingStatus").innerHTML = "Atividade enviada";
              const dbutton2 = document.getElementById('doneButton');
              dbutton2.className = "button3";
              dbutton2.onclick = function() {location.reload();};
            } finally {
              // Nothing to do, I guess;
            }});
          break;
        case 3: // URL mode0Holder
          const mode1input = document.getElementById('mode1input');
          if (itemSelected == 1) {
            var dbRef = firebase.database().ref('review/Activity '+itemSelected).push();
            dbRef.set({
              team: team,
              sentBy: currentUser.displayName,
              sentOn: Date.now(),
              url: mode1input.value
            })
            openModal();
            recordSendFB(itemSelected, team);
          }
          document.getElementById('progressbar').className = "";
          document.getElementById('progressPercentage').style.width = "100%";
          document.getElementById('progressInd').innerHTML = "100%";
          document.getElementById("sendingStatus").innerHTML = "Atividade enviada";
          const dbutton = document.getElementById('doneButton');
          dbutton.className = "button3";
          dbutton.onclick = function() {location.reload();};
          break;
        default:
      }

      const taskAnswer = document.getElementById('taskAnswerValue').value;
      var hasRecorded = false;

      for (var i = 0; i <= 31; i++) {
        if (itemSelected == needsInput[i]) {
          firebase.database().ref('review/Activity '+itemSelected+'/'+team).set({
              number: taskAnswer,
              sentBy: currentUser.displayName,
              email: currentUser.email,
              sentOn: Date.now(),
          })
          hasRecorded = true;
        } else if (itemSelected == somePicsMode[i]) {
          for (var i = 0; i < imageId.length; i++) {
            firebase.database().ref('review/Activity '+itemSelected+'/'+team+'/'+imageId[i].key).set({
                sentBy: currentUser.displayName,
                email: currentUser.email,
                sentOn: Date.now(),
            })
          }
          hasRecorded = true;
        } else if (itemSelected == urlMode[i] || itemSelected == videoMode[i]) {
          hasRecorded = true;
        }
      }

      if (hasRecorded == false) {
        firebase.database().ref('review/Activity '+itemSelected+'/'+team).set({
            sentBy: currentUser.displayName,
            sentOn: Date.now(),
            email: currentUser.email
        })
      }
  }
}

// firebase analytics

function recordSendFB(activity, team) {
  firebase.analytics().logEvent('send_activity', {
    activity: activity,
    team: teamNames[team]
  })
}

function testforSend() {
  var inputAnswer = document.getElementById('taskAnswerValue').value;
  for (var i = 0; i < needsInput.length; i++) {
    if (itemSelected == needsInput[i]) {
      if (inputAnswer == "") {
        inputAnswer = "34863484647867412972416";
      }
    }
  }

  switch (currentMode) {
    case 0: // One pic mode
      const image = document.getElementById('insertPicture');
      var style = image.currentStyle || window.getComputedStyle(image, false);
      var bi = style.backgroundImage.slice(4, -1).replace(/"/g, "");
      if (bi != "" && inputAnswer != '34863484647867412972416') {
        return true;
      } else {
        return false;
      }
      break;
    case 1: // Some pics mode
      if (imagesUploaded > 0 && inputAnswer != '34863484647867412972416') {
        return true;
      } else {
        return false;
      }
      break;
    case 2: // Video
      const videoInput = document.getElementById('mode2input').value;
      if (videoInput != '') {
        return true;
      } else {
        return false;
      }
      break;
    case 3: // URL
      const urlInput = document.getElementById('mode1input').value;
      if (urlInput != '') {
        return true;
      } else {
        return false;
      }
      break;
    default:
      return false;
  }
}

// Send to cloud

var imageToUpload;

function uploadImage(input) {
  if (input.files && input.files[0]) {
    // https://stackoverflow.com/a/44505315/6496084
    var fileSize = input.files[0].size / 1024 / 1024; // in MB
    if (fileSize > 10) {
        alert('A imagem selecionada é muito grande. '+
        'Apenas imagens com menos de 10 MB são aceitas. '+
        'E cara, não sei como vc consegiu uma imagem desse tamanho. '+
        'Tá enviando em RAW só pode. '+
        'Ah, e só dá pra enviar em PNG, JPG e TIFF (n sei quem usa esse último mas tá aí a opção).');
        location.reload();
    }

    var reader = new FileReader();

    reader.onload = function(e) {
      document.getElementById('insertPicture').style.backgroundImage = "url('"+e.target.result+"')";
      document.getElementById('cameraDiv').className = "afterUpload";
      document.getElementById('addText').innerHTML = "Alterar Imagem";

      imageToUpload = null;
      imageToUpload = dataURLtoFile(e.target.result, "profile.png");
    }

    reader.readAsDataURL(input.files[0]);
  }
}

$("#inputFile").change(function() {
  uploadImage(this);
});

var imagesUploaded = 0;  // This variable is only useful to set a id to the items;

function uploadOneMoreImage(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function(e) {
      content = e.target.result;

      const span = document.getElementById('toUpload');
      const imageDiv = document.createElement('div');
      const closeButton = document.createElement('span');

      imageDiv.className = "smallPicture";
      imageDiv.style.backgroundImage = "url('"+content+"')";
      imageDiv.id = "dpic/"+ imagesUploaded;

      closeButton.className = "closeSmallPic";
      closeButton.innerHTML = "&times";
      closeButton.id = "spic/"+ imagesUploaded;
      closeButton.onclick = function() {closeSmallPic(this.id);};

      imageDiv.appendChild(closeButton);
      span.appendChild(imageDiv);

      imagesUploaded++;
    };

    reader.readAsDataURL(input.files[0]);
  }
}

$("#inputFile2").change(function() {
  uploadOneMoreImage(this);
});

function closeSmallPic(id) {

  var data = id.split("/");
  var id = Number(data[1]);

  const span = document.getElementById('toUpload');
  const child = document.getElementById('dpic/'+id);
  span.removeChild(child);
}

function storeImage(path, img) {
  const progressBar = document.getElementById('progressbar');
  const progressPercentage = document.getElementById('progressPercentage');
  const progressInd = document.getElementById('progressInd');
  progressBar.className = "";

  const promises = [];

  const uploadTask = firebase.storage().ref(path).put(img);
  promises.push(uploadTask);
  openModal();

  uploadTask.on('state_changed', snapshot => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(progress);
      progressPercentage.style.width = progress+"%";
      progressInd.innerHTML = Math.round(progress,2)+"%";
  }, error => { console.log(error) }, () => {
      uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
          console.log(downloadURL);
      });
  });

  Promise.all(promises).then(tasks => {
      console.log('File uploaded');
      document.getElementById("sendingStatus").innerHTML = "Atividade enviada"
      const dbutton = document.getElementById('doneButton');
      dbutton.className = "button3"
      dbutton.onclick = function() {location.reload();}
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

    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return [new File([u8arr], filename, {type:mime}), extension];
}

// Verify account

function verifyAccount() {
  var user = firebase.auth().currentUser;
  firebase.auth().languageCode = 'pt';
  user.sendEmailVerification().then(function() {
    alert('Email enviado, abra sua caixa de entrada para continuar.');
  }).catch(function(error) {
    alert('Não foi possível enviar um email para a verificação. Código de erro: '+error);
  });
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
  const loadMessage = document.getElementById("loading");
  const errorUser = document.getElementById("noUser");
  const errorTeam = document.getElementById("noTeam");
  const errorNone = document.getElementById("body");

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

      errorNone.className = "";

      // Get the team
      const currentUser = firebase.auth().currentUser;
      var dbRef = firebase.database().ref('users/' + currentUser.uid + "/team");
      dbRef.on('value', function(snapshot) {
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

function warning() {
  alert("Antes de enviar certifique-se de que a atividade contém os ítens necessários para sua aprovação, que podem ser encontrados na página \"Sobre\".");
}

// Modal popup
const modal = document.getElementById("myModal");
function openModal() {
  modal.style.display = "block";
}

// Send turned off

firebase.database().ref('settings').once('value').then(function(snap) {
  if (snap.val().allow_send != true) {
    document.getElementById('mySecondModal').style.display = 'block';
  }
})
