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

// Load teams

let teams;
firebase.database().ref('teams').on('value', function (snapshot) {
    teams = snapshot.val();

    // Add teams to option list
    teams.map(function (team, index) {
        const option = document.createElement("option");
        option.value = index;
        option.text = team.name;

        document.getElementById("selectTeam").appendChild(option);

        document.getElementById("pointsTeam").value = teams[0].points;
        document.getElementById("teamImg").src = "files/teams/1.webp";
    });
});

// Modify teams

document.getElementById("selectTeam").addEventListener("change", function () {
    const t = parseInt(document.getElementById("selectTeam").value) + 1;
    document.getElementById("teamImg").src = "files/teams/" + t + ".webp";
    document.getElementById("pointsTeam").value = teams[t - 1].points;

    // Mark done activities
    markDoneActivities(t);
});

function savePoints() {
    const team = document.getElementById("selectTeam").value;
    const points = document.getElementById("pointsTeam").value;

    const confirmSave = confirm("Após salvar, o valor antigo será apagado, deseja mesmo proceder?");

    if (confirmSave == true) {
        firebase.database().ref('teams/' + team).update({
            points: points
        });

        alert("Pointos salvos!");
    } else {
        alert("Pontos não salvos!");
    }
}

// Load activities

firebase.database().ref('activities').on('value', function (activities) {

    let index = 0;

    // Add activities to option list
    activities.forEach(function (activity) {
        const checkbox = document.createElement("input");
        const act = document.createElement("label");
        const div = document.createElement("div");

        checkbox.type = "checkbox";
        checkbox.id = "teamCheckbox" + activity.key;
        checkbox.value = index;
        checkbox.name = "teamCheckbox" + index;
        checkbox.className = "teamCheckbox";

        act.innerHTML = activity.val().title;
        act.className = "act";
        act.htmlFor = "teamCheckbox" + index;

        div.className = "actDiv";

        div.appendChild(checkbox);
        div.appendChild(act);

        document.getElementById("atividadesEquipe").appendChild(div);

        if (activities.numChildren() == index + 1) {
            markDoneActivities(1);
        }

        index++;
    });
});

// Mark done activities
function markDoneActivities(team) {

    // Clear checkboxes
    const checkboxes = document.getElementsByClassName("teamCheckbox");

    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }

    firebase.database().ref('teams/' + (team - 1) + '/tasks').once('value', function (snapshot) {
        let index = 0;

        snapshot.forEach(function (activity) {
            document.getElementById("teamCheckbox" + activity.key).checked = activity.val().done;

            index++;
        });
    });
}

// Save done activities

function saveActivityDone() {
    const teamID = document.getElementById("selectTeam").value;
    const activities = document.getElementsByClassName("teamCheckbox");

    const confirmSave = confirm("Após salvar, as atividades e datas serão alteradas, deseja mesmo proceder?");

    if (confirmSave == true) {
        firebase.database().ref('activities').once('value', function (snapshot) {
            let index = 0;

            snapshot.forEach(function (activity) {

                // Save activity done if checkbox is checked
                if (activities[index].checked) {
                    firebase.database().ref('teams/' + teamID + '/tasks/' + activity.key).set({
                        done: true
                    });
                }

                // Verify unchecked checkboxes
                if (!activities[index].checked) {
                    firebase.database().ref('teams/' + teamID + '/tasks/' + activity.key).remove();
                }

                index++;
            });
        });

        const toa = toast("Atividades salvas!");
        setTimeout(function () {
            toa.remove();
        }, 3000);
    }
}


// Add activity

function addAtividade() {
    const activityTitle = document.getElementById("addTitulo").value;
    const activityDescription = document.getElementById("addDescricao").value;
    const activityPoints = document.getElementById("addPontos").value;
    const activityPointsDesc = document.getElementById("addPontosDesc").value;

    // Get chackboxes
    const checkboxes = document.getElementsByName("addCategoria");
    let activityCheckboxes = [];

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            activityCheckboxes.push(checkboxes[i].value);
        }
    }

    // Check if all fields are filled, else alert
    if (activityTitle == "" || activityDescription == "" || activityPoints == "") {
        alert("Preencha todos os campos!");
    } else {
        const image = document.getElementById("addFoto").files[0];

        if (image) {
            const storageRef = firebase.storage().ref().child('activity/' + image.name);
            const task = storageRef.put(image);

            const toastObj = toast("Enviando imagem... (0%)");

            task.on('state_changed', function (snapshot) {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                toastObj.innerHTML = "Enviando imagem... (" + Math.floor(progress) + "%)";
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        toastObj.innerHTML = "Enviando imagem... (Pausado)";
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                }
            }, function (error) {
                const errorToast = toast("Erro ao enviar imagem!");
                setTimeout(function () {
                    errorToast.remove();
                }, 3000);
            }, function () {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                task.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    // Create activity
                    firebase.database().ref('activities').push({
                        title: activityTitle,
                        description: activityDescription,
                        points: activityPoints,
                        pointsDesc: activityPointsDesc,
                        categories: activityCheckboxes,
                        image: downloadURL
                    });

                    toastObj.innerHTML = "Atividade adicionada!";

                    clearAtividadeFields();

                    setTimeout(function () {
                        toastObj.remove();
                    }, 3000);
                });
            });
        } else {
            alert("Selecione uma imagem!");
        }
    }

}

// Load all activities

firebase.database().ref('activities').on('value', function (snapshot) {

    // Clear activities
    document.getElementById("activities").innerHTML = "";

    // Create array of activities
    let activitiesList = [];
    snapshot.forEach(function (childSnapshot) {
        activitiesList.push(childSnapshot.val());
        // Save database reference
        activitiesList[activitiesList.length - 1].ref = childSnapshot.ref;
    });

    // Create divs for each activity
    for (let i = 0; i < activitiesList.length; i++) {
        const activity = activitiesList[i];

        const div = document.createElement("div");
        div.className = "activity";

        const img = document.createElement("img");
        img.src = activity.image;

        const title = document.createElement("h3");
        title.innerHTML = activity.title;

        // Button to open edit

        const editButton = document.createElement("div");
        editButton.className = "editButton";
        editButton.innerHTML = "Editar";
        editButton.addEventListener("click", function () {
            // Open edit modal
            document.getElementById("modalEdit").style.display = "block";

            // Close modal when clicked outside
            window.onclick = function (event) {
                if (event.target == document.getElementById("modalEdit")) {
                    document.getElementById("modalEdit").style.display = "none";
                }
            }

            // Fill modal fields with activity data
            document.getElementById("editTitulo").value = activity.title;
            document.getElementById("editDescricao").value = activity.description;
            document.getElementById("editPontos").value = activity.points;
            document.getElementById("editPontosDesc").value = activity.pointsDesc;

            // Clear checkboxes
            const checkboxes = document.getElementsByName("editCategoria");
            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].checked = false;
            }

            // Check checkboxes
            for (let i = 0; i < checkboxes.length; i++) {
                if (activity.categories.includes(checkboxes[i].value)) {
                    checkboxes[i].checked = true;
                }
            }

            // Set image
            document.getElementById("editFoto").src = activity.image;

            // Save database reference to button onclick
            document.getElementById("editAtividade").onclick = function () {
                editActivity(activity.ref);
            }

            // Save database reference to delete button onclick
            document.getElementById("deleteAtividade").onclick = function () {
                if (confirm("Deseja mesmo apagar a atividade?")) {
                    activity.ref.remove();
                    document.getElementById("modalEdit").style.display = "none";

                    popup("Atividade apagada!");
                    setTimeout(function () {
                        popup.remove();
                    }, 3000);
                }
            }
        });

        div.appendChild(img);
        div.appendChild(title);
        div.appendChild(editButton);

        document.getElementById("activities").appendChild(div);
    }
});

// Save edited activity

function editActivity(ref) {
    const activityTitle = document.getElementById("editTitulo").value;
    const activityDescription = document.getElementById("editDescricao").value;
    const activityPoints = document.getElementById("editPontos").value;
    const activityPointsDesc = document.getElementById("editPontosDesc").value;

    // Get chackboxes
    const checkboxes = document.getElementsByName("editCategoria");
    let activityCheckboxes = [];

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            activityCheckboxes.push(checkboxes[i].value);
        }
    }

    // Check if a image was selected and upload it and save the url
    const image = document.getElementById("editFoto").files[0];

    if (image) {
        const storageRef = firebase.storage().ref().child('activity/' + image.name);
        const task = storageRef.put(image);

        const toastObj = toast("Enviando imagem... (0%)");

        task.on('state_changed', function (snapshot) {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            toastObj.innerHTML = "Enviando imagem... (" + Math.floor(progress) + "%)";
            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                    toastObj.innerHTML = "Enviando imagem... (Pausado)";
                    break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.log('Upload is running');
                    toastObj.innerHTML = "Enviando imagem... (Enviando)";
                    break;
            }
        }, function (error) {
            const errorToast = toast("Erro ao enviar imagem!");
            setTimeout(function () {
                errorToast.remove();
            }, 3000);
        }, function () {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            task.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                // Update activity image url
                ref.update({
                    image: downloadURL
                });

                // Toast
                toastObj.innerHTML = "Imagem enviada!";

                setTimeout(function () {
                    toastObj.remove();
                }, 3000);
            });
        });
    }

    // Save only changed fields
    if (activityTitle != "") {
        ref.update({
            title: activityTitle
        });
    }
    if (activityDescription != "") {
        ref.update({
            description: activityDescription
        });
    }
    if (activityPoints != "") {
        ref.update({
            points: activityPoints
        });
    }
    if (activityPointsDesc != "") {
        ref.update({
            pointsDesc: activityPointsDesc
        });
    }
    if (activityCheckboxes.length > 0) {
        ref.update({
            categories: activityCheckboxes
        });
    }

    // Close modal
    document.getElementById("modalEdit").style.display = "none";

    const pop = toast("Atividade editada!");

    setTimeout(function () {
        pop.remove();
    }, 3000);

}

// Limpar atividades após envio

function clearAtividadeFields() {
    document.getElementById("addTitulo").value = "";
    document.getElementById("addDescricao").value = "";
    document.getElementById("addPontos").value = "";
    document.getElementById("addPontosDesc").value = "";
    document.getElementById("addFoto").files[0] = "";

    document.getElementById("addFotoLabel").innerHTML = "<i class=\"material-icons\" style=\"font-size: 42px;\">add_a_photo</i>Selecione uma imagem";
    document.getElementById("addFotoLabel").style.backgroundImage = "radial-gradient(circle farthest-corner at 10% 20%, rgba(37, 145, 251, 1) 0.1%, rgba(0, 7, 128, 1) 100%);";

    const checkboxes = document.getElementsByName("addCategoria");

    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }
}

// Load and set general settings

firebase.database().ref("settings").once("value").then(function (snapshot) {
    const settings = snapshot.val();

    // Check checkboxes if true
    if (settings.allow_send) {
        document.getElementById("ajustes1").checked = true;
        document.getElementById("ajustescard1").className = "card2";
    }
    if (settings.login) {
        document.getElementById("ajustes2").checked = true;
        document.getElementById("ajustescard2").className = "card2";
    }
    if (settings.we_have_a_winner) {
        document.getElementById("ajustes3").checked = true;
        document.getElementById("ajustescard3").className = "card2";
    }
});

// Add listener to general settings checkboxes

document.getElementById("ajustes1").addEventListener("click", function () {
    const ref = firebase.database().ref("settings");

    if (this.checked) {
        ref.update({
            allow_send: true
        });
        document.getElementById("ajustescard1").className = "card2";
    } else {
        ref.update({
            allow_send: false
        });
        document.getElementById("ajustescard1").className = "card2 disabled";
    }
});

document.getElementById("ajustes2").addEventListener("click", function () {
    const ref = firebase.database().ref("settings");

    if (this.checked) {
        ref.update({
            login: true
        });
        document.getElementById("ajustescard2").className = "card2";
    } else {
        ref.update({
            login: false,
            allow_send: false
        });
        document.getElementById("ajustescard1").className = "card2 disabled";
        document.getElementById("ajustescard2").className = "card2 disabled";
        document.getElementById("ajustes1").checked = false;
    }
});

document.getElementById("ajustes3").addEventListener("click", function () {
    const ref = firebase.database().ref("settings");

    if (this.checked) {
        ref.update({
            we_have_a_winner: true
        });
        document.getElementById("ajustescard3").className = "card2";
    } else {
        ref.update({
            we_have_a_winner: false
        });
        document.getElementById("ajustescard3").className = "card2 disabled";
    }
});

// Open and close popups
let breakI = false;

function openPopup(popup) {
    document.getElementById(popup).style.width = "100%";
    document.getElementById("logo").style.color = "white";
    document.getElementById("menu").style.filter = "brightness(2.5)";

    if (popup == "popup1" && !breakI) {
        markDoneActivities(1);
        breakI = true;
    }
}

function closePopup(popup) {
    document.getElementById(popup).style.width = "0%";
    document.getElementById("logo").style.color = "black";
    document.getElementById("menu").style.filter = "brightness(1)";
}

// Change input if image is selected

document.getElementById("addFoto").addEventListener("change", function () {
    if (document.getElementById("addFoto").value != "") {
        document.getElementById("addFotoLabel").innerHTML = "<i class=\"material-icons\" style=\"font-size: 42px;\">photo</i></i>Imagem selecionada";
        document.getElementById("addFotoLabel").style.backgroundImage = "radial-gradient(circle farthest-corner at 10% 20%, rgb(251 96 37) 0.1%, rgb(128 0 53) 100%)";
    } else {
        document.getElementById("addFotoLabel").innerHTML = "<i class=\"material-icons\" style=\"font-size: 42px;\">add_a_photo</i>Selecione uma imagem";
        document.getElementById("addFotoLabel").style.backgroundImage = "radial-gradient(circle farthest-corner at 10% 20%, rgba(37, 145, 251, 1) 0.1%, rgba(0, 7, 128, 1) 100%);";
    }

    console.log(document.getElementById("addFoto").value);
});

// Posts

// Send post

function sendPost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;

    if (title != "" && content != "") {
        const ref = firebase.database().ref("posts");

        const post = {
            title: title,
            content: content,
            date: Date.now()
        };

        ref.push(post);

        const pop = toast("Post enviado!");

        setTimeout(function () {
            pop.remove();
        }, 3000);

        document.getElementById('postTitle').value = "";
        document.getElementById('postContent').value = "";
    } else {
        const pop = toast("Preencha todos os campos!");

        setTimeout(function () {
            pop.remove();
        }, 3000);
    }
}

// Load posts

firebase.database().ref("posts").on("value", function (snapshot) {
    const posts = snapshot.val();

    const postList = document.getElementById("postsAtivos");

    postList.innerHTML = "";

    for (let key in posts) {
        const post = posts[key];

        const postDiv = document.createElement("div");
        postDiv.className = "post";

        const postTitle = document.createElement("input");
        postTitle.className = "postTitle";
        postTitle.value = post.title;

        const postContent = document.createElement("textarea");
        postContent.className = "postContent";
        postContent.value = post.content;

        const postDate = document.createElement("p");
        postDate.className = "postDate";
        postDate.innerHTML = "Publicado em " + new Date(post.date).toLocaleDateString();

        const postDelete = document.createElement("i");
        postDelete.className = "material-icons";
        postDelete.innerHTML = "delete";

        postDelete.addEventListener("click", function () {

            // Confirm
            if (confirm("Tem certeza que deseja excluir o post?")) {
                firebase.database().ref("posts/" + key).remove();
                const pop = toast("Post deletado!");

                setTimeout(function () {
                    pop.remove();
                }, 3000);
            }

        });

        const postSaveEdits = document.createElement("i");
        postSaveEdits.className = "material-icons";
        postSaveEdits.innerHTML = "save";

        postSaveEdits.addEventListener("click", function () {
            const ref = firebase.database().ref("posts/" + key);

            const post = {
                title: postTitle.value,
                content: postContent.value,
                date: Date.now()
            };

            ref.update(post);

            const pop = toast("Post editado!");

            setTimeout(function () {
                pop.remove();
            }, 3000);
        });

        postDiv.appendChild(postTitle);
        postDiv.appendChild(postContent);
        postDiv.appendChild(postDate);
        postDiv.appendChild(postDelete);
        postDiv.appendChild(postSaveEdits);

        // Card

        const card = document.createElement("div");
        card.className = "card2";

        card.appendChild(postDiv);

        postList.appendChild(card);
    }
});

//////////////
// Schedule //
//////////////

const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

function buildTable() {
    const table = document.getElementById('table');
    table.style.display = "table";

    var hour = 8;
    var min = "00";

    for (var i = 0; i < 30; i++) {
        const tr = document.createElement('tr');
        const date = document.createElement('td');

        date.innerHTML = hour + "h" + min;
        if (min == "30") {
            min = "00";
            hour++;
        } else {
            min = "30";
        }

        date.style.width = "5vw";

        tr.appendChild(date);

        for (var i2 = 0; i2 < 5; i2++) {
            const collum = document.createElement('td');
            collum.id = i + "/" + i2;
            tr.appendChild(collum);
        }

        table.appendChild(tr);
    }

    firebase.database().ref('schedule').on('child_added', function (snap) {
        const cellCollum = snap.val().week_day;
        const cellRow = snap.val().start_time;
        const cellLenght = (snap.val().end_time - cellRow);

        const currentCell = document.getElementById(cellRow + "/" + cellCollum);
        currentCell.innerHTML = snap.val().title;
        currentCell.rowSpan = cellLenght + 1;
        currentCell.className = "hasContent mode" + snap.val().type;
        currentCell.onclick = function () {
            inflateInfo(snap.key)
        };
    });

    // Remove unused cells
    firebase.database().ref('schedule').once('value').then(function () {
        for (var i = 0; i < 28; i++) {
            for (var i2 = 0; i2 < 5; i2++) {
                const analysedCell = document.getElementById(i + "/" + i2);
                if (analysedCell.innerHTML == "") {
                    analysedCell.parentNode.removeChild(analysedCell);
                }
            }
        }
    })
}

buildTable();

// inflateInfo
const colors = ["#a5d6a7", "#c4c4c4", "#fff49d", "#fdc391", "#FAD2CF", "#c5d8f7"];
let currentEvent;
let modeEditEvent;

function inflateInfo(eventNumber) {
    firebase.database().ref('schedule/' + eventNumber).once('value').then(function (snap) {
        document.getElementById('eventTitle').value = snap.val().title;
        document.getElementById('eventDescription').value = (snap.val().desc) ? snap.val().desc : "Descrição não informada.";
        document.getElementById('eventDate').value = snap.val().week_day;
        document.getElementById('startTime').value = snap.val().start_time;
        document.getElementById('endTime').value = snap.val().end_time;
        document.getElementById('eventLocation').value = (snap.val().location) ? snap.val().location : "Local não definido.";
        document.getElementById('cube' + snap.val().type).className += " mode-selected";
        document.getElementById('modalImage').style.backgroundImage = "url('./files/image/bg" + snap.val().type + ".svg')";
        document.getElementById('modalImage').style.backgroundColor = colors[snap.val().type];
        openModal(eventNumber);
        currentEvent = eventNumber;
        modeEditEvent = snap.val().type;
    })
}

function selectModeEdit(mode) {
    modeEditEvent = mode;

    for (var i = 0; i < 7; i++) {
        const cube = document.getElementById("cube" + i);
        cube.className = "cube mode" + i;
    }

    const cube = document.getElementById("cube" + mode);
    cube.className += " mode-selected";
}

function addEvent() {

    // Clear modal
    document.getElementById('eventTitle').value = "";
    document.getElementById('eventDescription').innerHTML = "";
    document.getElementById('eventDate').value = "";
    document.getElementById('startTime').value = "0";
    document.getElementById('endTime').value = "0";
    document.getElementById('eventLocation').value = "";
    document.getElementById('cube0').className = "cube mode0";
    document.getElementById('cube1').className = "cube mode1";
    document.getElementById('cube2').className = "cube mode2";
    document.getElementById('cube3').className = "cube mode3";
    document.getElementById('cube4').className = "cube mode4";
    document.getElementById('cube5').className = "cube mode5";

    openModal(-1);
    currentEvent = -1;
}

function saveEventEdit() {

    // // Check if the event overlaps with another
    // const start = document.getElementById('startTime').value;
    // const end = document.getElementById('endTime').value;
    // const day = document.getElementById('eventDate').value;

    // for (var i = start; i < end; i++) {
    //     const cell = document.getElementById(i + "/" + day);
    //     if (cell.className == "hasContent") {
    //         const pop = toast("Este evento se sobrepõe a outro!");
    //         setTimeout(function () {
    //             pop.remove();
    //         }, 3000);
    //         return;
    //     }
    // }

    const event = {
        title: document.getElementById('eventTitle').value,
        desc: document.getElementById('eventDescription').value,
        week_day: document.getElementById('eventDate').value,
        start_time: document.getElementById('startTime').value,
        end_time: document.getElementById('endTime').value,
        location: document.getElementById('eventLocation').value,
        type: modeEditEvent
    };

    if (currentEvent == -1) {
        firebase.database().ref('schedule').push(event).then(function () {
            const pop = toast("Evento adicionado com sucesso!");
            setTimeout(function () {
                pop.remove();
            }, 3000);

            // Reload table
            const table = document.getElementById('table');
            table.innerHTML = "";
            buildTable();
        });
    } else {
        const ref = firebase.database().ref("schedule/" + currentEvent);
        ref.update(event).then(function () {
            const pop = toast("Evento editado com sucesso!");
            setTimeout(function () {
                pop.remove();
            }, 3000);

            // Reload table
            const table = document.getElementById('table');
            table.innerHTML = "";
            buildTable();
        });
    }

    modal.style.display = "none";
    history.pushState('', document.title, window.location.pathname);
    document.getElementById('modalImage').style.backgroundImage = "";
}

function deleteEvent() {
    const ref = firebase.database().ref("schedule/" + currentEvent);

    if (confirm("Deseja realmente excluir este evento?")) {
        ref.remove();
        const pop = toast("Evento excluído!");

        // Reload table
        const table = document.getElementById('table');
        table.innerHTML = "";
        buildTable();

        setTimeout(function () {
            pop.remove();
        }, 3000);
    }
}

// Modal popup
const modal = document.getElementById("modal");

function openModal(v) {

    if (v == -1) {
        document.getElementsByClassName('blockDiv')[0].style.top = "0px";
    } else {
        document.getElementsByClassName('blockDiv')[0].style.top = "200px";
    }

    // https://gist.github.com/thedamon/9276193
    var hash = v;
    window.location.hash = hash;
    window.onhashchange = function () {
        if (!location.hash) {
            modal.style.display = "none";
        }
    }

    var span = document.getElementById("closeModal");

    modal.style.display = "block";

    span.onclick = function () {
        modal.style.display = "none";
        history.pushState('', document.title, window.location.pathname);
        document.getElementById('modalImage').style.backgroundImage = "";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            history.pushState('', document.title, window.location.pathname);
            document.getElementById('modalImage').style.backgroundImage = "";
        }
    }
}

// Toast

function toast(message) {
    const body = document.getElementById("body");

    const toastBox = document.createElement("div");
    toastBox.className = "toastBox";
    toastBox.innerHTML = message;

    body.appendChild(toastBox);

    return toastBox;
}

// ******************
// Users
// ******************

const userList = document.getElementById('userList');

firebase.database().ref('users').on('value', function (snap) {
    userList.innerHTML = "";

    snap.forEach(function (child) {
        const user = child.val();
        const userId = child.key;

        // Create elements
        const userBox = document.createElement("div");
        userBox.className = "userBox";

        const userName = document.createElement("div");
        userName.className = "userName";
        userName.innerHTML = user.name;

        const userEmail = document.createElement("div");
        userEmail.className = "userEmail";
        userEmail.innerHTML = user.email;

        const userTeam = document.createElement("div");
        userTeam.className = "userTeam";
        userTeam.innerHTML = "Equipe #" + user.team;

        const userPhoto = document.createElement("div");
        userPhoto.className = "userPhoto";
        userPhoto.style.backgroundImage = "url('" + user.photo + "')";

        const userUID = document.createElement("div");
        userUID.className = "userUID";
        userUID.innerHTML = userId;

        const userModify = document.createElement("input");
        userModify.type = "button";
        userModify.value = "Modificar";
        userModify.className = "userModify";
        userModify.onclick = function () {
            openUserModal(userId);
        };

        const userDelete = document.createElement("input");
        userDelete.type = "button";
        userDelete.value = "Excluir";
        userDelete.className = "userDelete";
        userDelete.onclick = function () {
            if (confirm("Deseja realmente excluir este usuário?")) {
                firebase.database().ref('users/' + userId).remove();
                const pop = toast("Usuário excluído!");

                setTimeout(function () {
                    pop.remove();
                }, 3000);
            }
        }

        // Append elements
        userBox.appendChild(userPhoto);
        userBox.appendChild(userName);
        userBox.appendChild(userEmail);
        userBox.appendChild(userUID);
        userBox.appendChild(userTeam);
        userBox.appendChild(userModify);
        userBox.appendChild(userDelete);

        userList.appendChild(userBox);
    });
});

function openUserModal(userId) {
    const ref = firebase.database().ref("users/" + userId);

    ref.once('value').then(function (snap) {
        const user = snap.val();

        document.getElementById('editUserName').value = user.name;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserTeam').value = user.team;
        document.getElementById('editUserPhoto').src = user.photo;

        if (user.veteran) {
            document.getElementById('editUserVeteran').checked = user.veteran;
        }
        
        document.getElementById('modalEditUser').style.display = "block";
    });

    // Close when click outside
    window.onclick = function (event) {
        if (event.target == document.getElementById('modalEditUser')) {
            document.getElementById('modalEditUser').style.display = "none";
        }
    }

    // Delete image on click
    document.getElementById('editUserPhoto').onclick = function () {
        if (confirm("Ao confirmar a imagem será removida.")) {
            document.getElementById('editUserPhoto').src = null;
        }
    }

    // Save user
    document.getElementById('editUserSave').onclick = function () {
        saveUserInfo(userId);
    }

}

function saveUserInfo(userId) {
    const ref = firebase.database().ref("users/" + userId);

    const name = document.getElementById('editUserName').value;
    const email = document.getElementById('editUserEmail').value;
    const teamEdit = document.getElementById('editUserTeam').value;
    const photo = document.getElementById('editUserPhoto').src;
    const veteran = document.getElementById('editUserVeteran').checked;

    // Confirm save
    if (confirm("Deseja realmente salvar as alterações?")) {
        ref.update({
            name: name,
            email: email,
            team: teamEdit,
            photo: photo,
            veteran: veteran
        });

        const pop = toast("Usuário atualizado!");

        setTimeout(function () {
            pop.remove();
        }, 3000);

        document.getElementById('modalEditUser').style.display = "none";
    }
}


// ******************
// Default code
// ******************

headerShadow();

function headerShadow() {
    if (document.body.scrollTop == 0 || document.documentElement.scrollTop == 0) {
        document.getElementById("header").className = "headerNoShadow";
    }
    if (document.body.scrollTop != 0 || document.documentElement.scrollTop != 0) {
        document.getElementById("header").className = "";
    }
}

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
                // defineBgColor(team); Still haven't decided if this will be kept
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