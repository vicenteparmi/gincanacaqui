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

// My code

var currentMode = null;
var itemSelected = -1;

fullList = false;

// Inflate list

var numberOnList = 1;

let activitiesList = [];

firebase
  .database()
  .ref("activities/")
  .once("value")
  .then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      // Check if the activity is not of category 7 (entrega presencial)
      if (!childSnapshot.val().categories.includes("7")) {
        // Save info to activitiesList with key
        activitiesList[childSnapshot.key] = childSnapshot.val();

        // Create div for each activity
        const div = document.createElement("div");
        div.className = "bodyActItem";
        div.id = "ti" + childSnapshot.key;
        div.onclick = function () {
          sti(this.id);
        };

        // Title and points blocks
        const title = document.createElement("span");
        title.className = "title";
        title.innerHTML = numberOnList + ". " + childSnapshot.val().title;

        const points = document.createElement("span");
        points.className = "points";
        points.innerHTML =
          "+" +
          childSnapshot.val().points +
          " pontos " +
          childSnapshot.val().pointsDesc;

        // Add title and points to div
        div.appendChild(title);
        div.appendChild(points);

        // Add div to activityContainer
        const activityContainer = document.getElementById("activityContainer");
        activityContainer.appendChild(div);

        numberOnList++;
      }
    });
  });

// Activity Selector

function sti(id) {
  // Clear error
  errorMessage.className = "hide";

  const mode0Holder = document.getElementById("sendOnePhoto");
  const mode1Holder = document.getElementById("sendMorePhotos");
  const mode2Holder = document.getElementById("sendVideo");
  const mode3Holder = document.getElementById("sendLink");

  mode0Holder.className = "hidden";
  mode1Holder.className = "hidden";
  mode2Holder.className = "hidden";
  mode3Holder.className = "hidden";

  const nothingSelected = document.getElementById("nothingSelected");
  nothingSelected.className = "hide";
  const somethingSelected = document.getElementById("somethingSelected");
  somethingSelected.className = "bodyItem";

  // Clear previous selection
  if (itemSelected != -1) {
    const previousSelection = document.getElementById("ti" + itemSelected);
    previousSelection.className = "bodyActItem";
  }

  // Set active class to div
  const div = document.getElementById(id);
  div.className = "bodyActItem active";

  // Remove first 3 characters from id
  itemSelected = id.substring(2);

  // Find info from activitiesList by key
  document.getElementById("activityName").innerHTML =
    activitiesList[itemSelected].title;

  // Set currentMode with category
  categories = activitiesList[itemSelected].categories;

  const taskAnswer = document.getElementById("taskAnswer");

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
    taskAnswer.className = "";
  } else if (categories.includes("4")) {
    console.log("Link modeee");
    currentMode = 3; // Link mode
    taskAnswer.className = "";
  }

  document.getElementById("description").innerHTML =
    activitiesList[itemSelected].description;
  document.getElementById("points").innerHTML =
    "+" +
    activitiesList[itemSelected].points +
    " pontos " +
    activitiesList[itemSelected].pointsDesc;

  // Setup Infobox
  const infobox = document.getElementById("infobox");
  const photoNumber = document.createElement("div");
  const sendOn = document.createElement("div");
  const needAnswer = document.createElement("div");
  const veteran = document.createElement("div");

  photoNumber.className = "chips";
  sendOn.className = "chips";
  needAnswer.className = "chips";
  veteran.className = "chips";

  // Inflate infobox;
  infobox.innerHTML = "";

  // Pictures to send;
  if (activitiesList[itemSelected].categories.includes("3")) {
    photoNumber.innerHTML =
      "<img src='files/image/onePicMode.svg' class='chipimg'/>Uma imagem";
    photoNumber.style.backgroundColor = "#421d85";
  } else if (activitiesList[itemSelected].categories.includes("2")) {
    photoNumber.innerHTML =
      "<img src='files/image/somePicsMode.svg' class='chipimg'/>Várias imagens";
    photoNumber.style.backgroundColor = "#e91e63";
  } else if (activitiesList[itemSelected].categories.includes("6")) {
    photoNumber.innerHTML =
      "<img src='files/image/videoMode.svg' class='chipimg'/>Vídeo";
    photoNumber.style.backgroundColor = "#f44336";
  } else {
    photoNumber.style.display = "none";
  }

  // Places to send
  if (activitiesList[itemSelected].categories.includes("7")) {
    sendOn.innerHTML =
      "<img src='files/image/noWebsite.svg' class='chipimg'/>Entrega presencial";
    sendOn.style.backgroundColor = "#0097a7";
  } else if (activitiesList[itemSelected].categories.includes("1")) {
    sendOn.innerHTML =
      "<img src='files/image/websiteMode.svg' class='chipimg'/>Envio pelo site";
    sendOn.style.backgroundColor = "#ff9800";
  }

  // Need answers
  if (activitiesList[itemSelected].categories.includes("4")) {
    needAnswer.innerHTML =
      "<img src='files/image/answerNeeded.svg' class='chipimg'/>Precisa de resposta";
    needAnswer.style.backgroundColor = "#009688";
  } else {
    needAnswer.style.display = "none";
  }

  // Veteran needed
  if (activitiesList[itemSelected].categories.includes("5")) {
    veteran.innerHTML =
      "<img src='files/image/veteran.svg' class='chipimg'/>Veterano necessário";
    veteran.style.backgroundColor = "#4caf50";
  } else {
    veteran.style.display = "none";
  }

  infobox.appendChild(photoNumber);
  infobox.appendChild(sendOn);
  infobox.appendChild(needAnswer);
  infobox.appendChild(veteran);

  // Clear fields
  document.getElementById("taskAnswer").value = "";
  document.getElementById("mode1input").value = "";

  // Smaller list if on mobile
  document.getElementById("bodyActList").className =
    "bodyItem activity-list afterClick";
}

function helpVideo() {
  alert(
    "Faça o upload do vídeo para algum serviço como Google Photos, YouTube ou Google Drive. Em seguida compartilhe o arquivo para obter o link. Em caso de mais dúvidas entre em contato na página 'sobre'."
  );
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
    errorMessage.innerHTML =
      "Termine de preencher as informações antes de enviar.";
    errorMessage.className = "";
  }

  if (allOk == true) {
    // Check if the team has the activity
    firebase
      .database()
      .ref("teams/" + (team - 1) + "/tasks/" + itemSelected)
      .once("value")
      .then(function (snapshot) {
        if (
          snapshot.val() == null ||
          activitiesList[itemSelected].categories.includes("8")
        ) {
          isInReview(team, itemSelected);
        } else {
          // If yes, warn the user
          errorMessage.innerHTML =
            "Essa atividade já foi aprovada para sua equipe.";
          errorMessage.className = "";
        }
      });
  }
}

function isInReview(team, activity) {
  // Verify if an activity in review matches the selected activity
  firebase
    .database()
    .ref("review")
    .once("value")
    .then(function (snapshot) {
      let safe = true;

      // If there is a review
      snapshot.forEach(function (childSnapshot) {
        if (
          childSnapshot.val().activity == activity &&
          childSnapshot.val().team == team &&
          !activitiesList[itemSelected].categories.includes("8")
        ) {
          errorMessage.innerHTML =
            "A atividade já foi enviada e está em revisão.";
          errorMessage.className = "";
          safe = false;
        }
      });

      // Check if there is any activity in review
      if (
        snapshot.numChildren() == 0 ||
        snapshot.val() == null ||
        safe == true
      ) {
        proceed();
      }
    });
}

function proceed() {
  // Upload images if it is required by the activity
  if (currentMode == 0) {
    // One pic mode
    uploadReviewImages([
      {
        path:
          "review/" +
          team +
          "/" +
          itemSelected +
          "/" +
          itemSelected +
          makeid(6),
        file: imageToUpload,
      },
    ]);
  } else if (currentMode == 1) {
    // More pics mode
    const uploads = imagesToUpload
      .filter(function (file) {
        return Boolean(file);
      })
      .map(function (file) {
        return {
          path: "review/" + team + "/" + itemSelected + "/" + makeid(12),
          file: file,
        };
      });
    uploadReviewImages(uploads);
  } else {
    sendToReview();
  }
}

function sendToReview() {
  const currentUser = firebase.auth().currentUser;

  let answer;

  if (document.getElementById("taskAnswerValue").value == "") {
    answer = document.getElementById("mode1input").value;
  } else {
    answer = document.getElementById("taskAnswerValue").value;
  }

  // Send record and then open modal
  firebase
    .database()
    .ref("review/")
    .push({
      team: team,
      userId: currentUser.uid,
      answer: answer,
      imageURLs: imageDownloadURL,
      activity: itemSelected,
      date: Date.now(),
    })
    .then(function () {
      // Open modal
      document.getElementById("myModal").style.display = "block";
      document.getElementById("progressbar").className = "";
      document.getElementById("progressPercentage").style.width = "0%";
      document.getElementById("progressPercentage").style.width = "100%";
      document.getElementById("progressInd").innerHTML = "100%";
      document.getElementById("progressInd").style.color = "white";
      document.getElementById("sendingStatus").innerHTML = "Atividade enviada";
      const dbutton2 = document.getElementById("doneButton");
      dbutton2.className = "button3";
      dbutton2.onclick = function () {
        location.reload();
      };

      // Save analytics
      recordSendFB(activitiesList[itemSelected].title, team);
    });
}

function recordSendFB(activity, team) {
  firebase.analytics().logEvent("send_activity", {
    activity: activity,
    team: team,
  });
}

function testforSend() {
  var inputAnswer = document.getElementById("taskAnswerValue").value;
  if (
    activitiesList[itemSelected].categories.includes("4") ||
    activitiesList[itemSelected].categories.includes("6")
  ) {
    if (inputAnswer == "") {
      return false;
    }
  }

  switch (currentMode) {
    case 0: // One pic mode
      return Boolean(imageToUpload);
    case 1: // Some pics mode
      return imagesToUpload.some(function (file) {
        return Boolean(file);
      });
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

var imageToUpload = null;

async function uploadImage(input) {
  if (input.files && input.files[0]) {
    const addText = document.getElementById("addText");
    imageToUpload = null;
    input.disabled = true;
    addText.innerHTML = "Comprimindo imagem...";

    try {
      const result = await compressImageFile(input.files[0]);
      document.getElementById("insertPicture").style.backgroundImage =
        "url('" + result.previewURL + "')";
      document.getElementById("cameraDiv").className = "afterUpload";
      addText.innerHTML = "Alterar Imagem";
      imageToUpload = result.file;
    } catch (error) {
      imageToUpload = null;
      addText.innerHTML = "Adicionar Imagem";
      alert(error.message || "Não foi possível preparar a imagem.");
    } finally {
      input.disabled = false;
      input.value = "";
    }
  }
}

$("#inputFile").change(function () {
  uploadImage(this);
});

var imagesUploaded = 0; // This variable is only useful to set a id to the items;
var imagesToUpload = [];

async function uploadOneMoreImage(input) {
  if (input.files && input.files[0]) {
    const addText = document.getElementById("addText2");
    input.disabled = true;
    addText.innerHTML = "Comprimindo imagem...";

    try {
      const result = await compressImageFile(input.files[0]);
      const span = document.getElementById("toUpload");
      const imageDiv = document.createElement("div");
      const closeButton = document.createElement("span");
      const imageIndex = imagesUploaded;

      imageDiv.className = "smallPicture";
      imageDiv.style.backgroundImage = "url('" + result.previewURL + "')";
      imageDiv.id = "dpic/" + imageIndex;

      closeButton.className = "closeSmallPic";
      closeButton.innerHTML = "&times";
      closeButton.id = "spic/" + imageIndex;
      closeButton.onclick = function () {
        closeSmallPic(this.id);
      };

      imageDiv.appendChild(closeButton);
      span.appendChild(imageDiv);

      imagesToUpload[imageIndex] = result.file;
      imagesUploaded++;
      addText.innerHTML = "Adicionar Imagem";
    } catch (error) {
      addText.innerHTML = "Adicionar Imagem";
      alert(error.message || "Não foi possível preparar a imagem.");
    } finally {
      input.disabled = false;
      input.value = "";
    }
  }
}

$("#inputFile2").change(function () {
  uploadOneMoreImage(this);
});

function closeSmallPic(id) {
  var data = id.split("/");
  var id = Number(data[1]);

  const span = document.getElementById("toUpload");
  const child = document.getElementById("dpic/" + id);
  if (child) {
    span.removeChild(child);
    imagesToUpload[id] = null;
  }
}

function uploadReviewImages(uploads) {
  document.getElementById("myModal").style.display = "block";
  const progressBar = document.getElementById("progressbar");
  const progressPercentage = document.getElementById("progressPercentage");
  const progressInd = document.getElementById("progressInd");
  progressBar.className = "";

  document.getElementById("sendingStatus").innerHTML = "Carregando imagem...";
  openModal();

  const progresses = uploads.map(function () {
    return 0;
  });

  const promises = uploads.map(function (upload, index) {
    return storeImage(upload.path, upload.file, function (progress) {
      progresses[index] = progress;
      const totalProgress =
        progresses.reduce(function (total, value) {
          return total + value;
        }, 0) / progresses.length;

      progressPercentage.style.width = totalProgress + "%";
      progressInd.innerHTML = Math.round(totalProgress) + "%";
      if (totalProgress > 50) {
        progressInd.style.color = "white";
      }
    });
  });

  Promise.all(promises)
    .then(function (urls) {
      imageDownloadURL = urls;
      document.getElementById("sendingStatus").innerHTML =
        "Salvando atividade...";
      sendToReview();
    })
    .catch(function (error) {
      console.log(error);
      document.getElementById("sendingStatus").innerHTML =
        "Não foi possível enviar as imagens";
      alert("Falha no envio das imagens. Verifique sua conexão e tente novamente.");
    });
}

function storeImage(path, img, onProgress) {
  return new Promise(function (resolve, reject) {
    const uploadTask = firebase.storage().ref(path).put(img, {
      contentType: img.type,
    });

    uploadTask.on(
      "state_changed",
      function (snapshot) {
        onProgress(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
      },
      reject,
      function () {
        uploadTask.snapshot.ref.getDownloadURL().then(resolve).catch(reject);
      }
    );
  });
}

// Verify account

function verifyAccount() {
  var user = firebase.auth().currentUser;
  firebase.auth().languageCode = "pt";
  user
    .sendEmailVerification()
    .then(function () {
      alert("Email enviado, abra sua caixa de entrada para continuar.");
    })
    .catch(function (error) {
      alert(
        "Não foi possível enviar um email para a verificação. Código de erro: " +
          error
      );
    });
}

// Make ID

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
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
      if (
        event.target != popupMenu &&
        event.target != popupLogged &&
        event.target != userPhoto
      ) {
        popupMenu.className = "popupMenu hide";
        popupLogged.className = "popupMenu hide";
        popupShow = false;
      }
    };
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

      document.getElementById("userName").innerHTML = name;
      document.getElementById("userEmail").innerHTML = email;
      document.getElementById("userPhoto").style.backgroundImage =
        "url('" + photoUrl + "')";

      errorNone.className = "";

      // Get the team
      const currentUser = firebase.auth().currentUser;
      var dbRef = firebase.database().ref("users/" + currentUser.uid + "/team");
      dbRef.on("value", function (snapshot) {
        team = snapshot.val();
        if (team == null) {
          errorTeam.className = "";
          errorNone.className = "hidden";
        }
      });

      // Test for verification (I think it's working)

      if (emailVerified != true) {
        document.getElementById("noVer").className = "";
        errorNone.className = "hidden";
      }
    } else {
      errorUser.className = "";
    }
    loadMessage.className = "hidden";
  });
}

function signOut() {
  firebase
    .auth()
    .signOut()
    .then(
      function () {
        console.log("Signed Out");
        location.reload();
      },
      function (error) {
        console.error("Sign Out Error", error);
      }
    );
}

var menuOpen = false;

function openMenu() {
  const menu = document.getElementById("menu");
  const menuHolder = document.getElementById("menuHolder");
  const sandwich = document.getElementById("sandwich");

  if (menuOpen == false) {
    menu.className = "show";
    menuHolder.className = "shadow";
    window.onclick = function () {
      if (event.target != menu && event.target != sandwich) {
        menu.className = "";
        menuHolder.className = "";
        menuOpen = false;
      }
    };
    menuOpen = true;
  } else {
    menu.className = "";
    menuHolder.className = "";
    menuOpen = false;
  }
}

// Modal popup
const modal = document.getElementById("myModal");

function openModal() {
  modal.style.display = "block";
}

// Send turned off

firebase
  .database()
  .ref("settings")
  .once("value")
  .then(function (snap) {
    if (snap.val().allow_send != true) {
      document.getElementById("mySecondModal").style.display = "block";
    }
  });

  // Schedule turned off

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
