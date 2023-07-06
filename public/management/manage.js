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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();
const auth = firebase.auth();

// **********************************************
// Global State
// **********************************************
let state = {
    teams: [],
    activities: [],
    users: [],
    posts: [],
    currentUser: null
};

// **********************************************
// Navigation & Router
// **********************************************
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    
    const titles = {
        'dashboard': 'Início',
        'teams': 'Gerenciar Equipes',
        'activities': 'Gerenciar Atividades',
        'users': 'Gerenciar Usuários',
        'posts': 'Mural de Postagens',
        'schedule': 'Cronograma',
        'settings': 'Configurações Gerais'
    };
    document.getElementById('pageTitle').innerText = titles[viewName] || 'Gerenciamento';
}

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        if (this.classList.contains('back-home')) return;
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});


// **********************************************
// Initialization
// **********************************************
window.onload = function() {
    loadAuth();
    loadTeams();
    loadActivities();
    loadUsers();
    loadPosts();
    loadSchedule();
    loadSettings();
};

function loadAuth() {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            state.currentUser = user;
            document.getElementById('headerUserName').innerText = user.displayName || user.email;
            if(user.photoURL) {
                document.getElementById('userPhoto').style.backgroundImage = `url('${user.photoURL}')`;
            }
        } else {
            document.getElementById('headerUserName').innerText = "Não logado";
        }
    });
}

function toggleUserMenu() {
    document.getElementById('userDropdown').classList.toggle('hidden');
}

function signOut() {
    auth.signOut().then(() => location.reload());
}

// **********************************************
// TEAMS MODULE
// **********************************************
function loadTeams() {
    db.ref('teams').on('value', snapshot => {
        state.teams = snapshot.val() || [];
        renderTeamsTable();
        updateDashboardStats();
    });
}

function renderTeamsTable() {
    const container = document.getElementById('teamsTableContainer');
    const searchTerm = document.getElementById('searchTeams').value.toLowerCase();
    const filteredTeams = state.teams.map((t, i) => ({...t, index: i})) 
                                     .filter(t => t.name.toLowerCase().includes(searchTerm));

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Logo</th>
                    <th>Nome</th>
                    <th>Pontos</th>
                    <th>Atividades</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    filteredTeams.forEach((team) => {
        let tasksCount = 0;
        if (team.tasks) {
            tasksCount = Object.values(team.tasks).filter(v => v === true).length;
        }
        const totalActivities = state.activities.length;

        html += `
            <tr>
                <td>${team.index + 1}</td>
                <td><img src="files/teams/${team.index + 1}.webp" class="small-thumb"></td>
                <td>${team.name}</td>
                <td>
                    <input type="number" 
                           class="inline-input" 
                           value="${team.points}" 
                           onblur="saveTeamPoints(${team.index}, this.value)"
                           onkeypress="if(event.keyCode==13) this.blur()">
                </td>
                <td><span class="badge">${tasksCount} / ${totalActivities}</span></td>
                <td>
                    <button class="btn btn-primary" 
                            style="padding: 5px 10px; font-size:12px" 
                            onclick="openTeamDetailsModal(${team.index})">
                        Detalhes
                    </button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
    
    // Populate User Filter Dropdown
    const userSelect = document.getElementById('filterUserTeam');
    if (userSelect && userSelect.options.length === 1) { 
        // Force clear to avoid duplicates if re-rendering often
        userSelect.innerHTML = '<option value="all">Todas as Equipes</option>';
        state.teams.forEach((t, i) => {
            const option = document.createElement('option');
            option.value = i + 1; 
            option.text = t.name;
            userSelect.add(option);
        });
    }
}

function saveTeamPoints(teamIndex, newPoints) {
    db.ref(`teams/${teamIndex}/points`).set(parseInt(newPoints));
}

document.getElementById('searchTeams').addEventListener('input', renderTeamsTable);

// --- TEAM DETAILS MODAL ---
let currentEditingTeamIndex = null;

function openTeamDetailsModal(teamIndex) {
    currentEditingTeamIndex = teamIndex;
    const team = state.teams[teamIndex];
    if(!team) return;

    document.getElementById('modalTeamName').innerText = team.name;
    document.getElementById('modalTeamLogo').src = `files/teams/${teamIndex + 1}.webp`;
    document.getElementById('modalTeamPoints').value = team.points;

    renderTeamActivitiesList(team);
    document.getElementById('modalTeam').classList.add('open');
}

function renderTeamActivitiesList(team) {
    const listContainer = document.getElementById('teamTasksList');
    const searchTerm = document.getElementById('searchTeamTasks').value.toLowerCase();
    
    const teamTasks = team.tasks || {}; 

    let html = '';
    
    const filteredActs = state.activities.filter(a => a.title.toLowerCase().includes(searchTerm));

    if (filteredActs.length === 0) {
        html = '<p style="padding:10px; color:#888;">Nenhuma atividade encontrada.</p>';
    } else {
        filteredActs.forEach(act => {
            const isCompleted = teamTasks[act.key] === true;
            html += `
                <div class="task-item-row">
                    <input type="checkbox" 
                           class="team-task-cb" 
                           value="${act.key}" 
                           ${isCompleted ? 'checked' : ''}>
                    <div style="flex-grow:1">
                        <div style="font-weight:600">${act.title}</div>
                        <div style="font-size:12px; color:#666">${act.points} pts</div>
                    </div>
                </div>
            `;
        });
    }

    listContainer.innerHTML = html;
}

document.getElementById('searchTeamTasks').addEventListener('input', () => {
   if (currentEditingTeamIndex !== null) {
       renderTeamActivitiesList(state.teams[currentEditingTeamIndex]);
   } 
});

function saveTeamPointsFromModal() {
    if (currentEditingTeamIndex === null) return;
    const val = document.getElementById('modalTeamPoints').value;
    saveTeamPoints(currentEditingTeamIndex, val);
    alert('Pontuação salva!');
}

function saveTeamTasks() {
    if (currentEditingTeamIndex === null) return;
    
    const currentTeam = state.teams[currentEditingTeamIndex];
    let updatedTasks = currentTeam.tasks ? {...currentTeam.tasks} : {};
    
    const checkboxes = document.querySelectorAll('.team-task-cb');
    checkboxes.forEach(cb => {
        if (cb.checked) {
            updatedTasks[cb.value] = true;
        } else {
            delete updatedTasks[cb.value];
        }
    });

    db.ref(`teams/${currentEditingTeamIndex}/tasks`).set(updatedTasks)
      .then(() => {
          closeModal('modalTeam');
          alert('Atividades atualizadas!');
      });
}


// **********************************************
// ACTIVITIES MODULE
// **********************************************
function loadActivities() {
    db.ref('activities').on('value', snapshot => {
        const data = snapshot.val();
        state.activities = [];
        for (let key in data) {
            state.activities.push({
                key: key,
                ...data[key]
            });
        }
        renderActivitiesTable();
        updateDashboardStats();
    });
}

function renderActivitiesTable() {
    const container = document.getElementById('activitiesTableContainer');
    const searchTerm = document.getElementById('searchActivities').value.toLowerCase();
    
    const filtered = state.activities.filter(a => a.title.toLowerCase().includes(searchTerm));
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th><input type="checkbox" onchange="toggleSelectAllActivities(this)"></th>
                    <th>Imagem</th>
                    <th>Título</th>
                    <th>Pontos</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    filtered.forEach(act => {
        html += `
            <tr>
                <td><input type="checkbox" class="act-checkbox" value="${act.key}" onchange="checkBulkDeleteActivities()"></td>
                <td><img src="${act.image}" class="small-thumb"></td>
                <td>${act.title}</td>
                <td>${act.points} <small style="color:#777">${act.pointsDesc || ''}</small></td>
                <td>
                    <button class="btn btn-primary" style="padding: 5px 10px;" onclick="openEditActivityModal('${act.key}')">Editar</button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

document.getElementById('searchActivities').addEventListener('input', renderActivitiesTable);

function toggleSelectAllActivities(source) {
    document.querySelectorAll('.act-checkbox').forEach(cb => {
        cb.checked = source.checked;
    });
    checkBulkDeleteActivities();
}

function checkBulkDeleteActivities() {
    const count = document.querySelectorAll('.act-checkbox:checked').length;
    document.getElementById('btnBulkDeleteActivities').disabled = count === 0;
}

function bulkDeleteActivities() {
    if(!confirm("Tem certeza que deseja deletar as atividades selecionadas?")) return;
    
    const checkboxes = document.querySelectorAll('.act-checkbox:checked');
    checkboxes.forEach(cb => {
        db.ref(`activities/${cb.value}`).remove();
    });
}

function openAddActivityModal() {
    document.getElementById('modalActivityTitle').innerText = "Nova Atividade";
    document.getElementById('activityForm').reset();
    document.getElementById('editActivityKey').value = "";
    document.getElementById('previewImgElement').style.display = 'none';
    document.getElementById('modalActivity').classList.add('open');
}

function openEditActivityModal(key) {
    const act = state.activities.find(a => a.key === key);
    if (!act) return;
    
    document.getElementById('modalActivityTitle').innerText = "Editar Atividade";
    document.getElementById('editActivityKey').value = key;
    document.getElementById('actTitle').value = act.title;
    document.getElementById('actDesc').value = act.description;
    document.getElementById('actPoints').value = act.points;
    document.getElementById('actPointsDesc').value = act.pointsDesc || "";
    
    const categories = act.categories || [];
    document.querySelectorAll('input[name="actCat"]').forEach(cb => {
        cb.checked = categories.includes(cb.value);
    });
    
    const imgPreview = document.getElementById('previewImgElement');
    imgPreview.src = act.image;
    imgPreview.style.display = 'block';
    
    document.getElementById('modalActivity').classList.add('open');
}

async function saveActivity() {
    const key = document.getElementById('editActivityKey').value;
    const title = document.getElementById('actTitle').value;
    const desc = document.getElementById('actDesc').value;
    const points = document.getElementById('actPoints').value;
    const pointsDesc = document.getElementById('actPointsDesc').value;
    const file = document.getElementById('actFile').files[0];
    
    const categories = [];
    document.querySelectorAll('input[name="actCat"]:checked').forEach(cb => categories.push(cb.value));
    
    if (!title || !points) {
        alert("Preencha título e pontos!");
        return;
    }

    let imageUrl = "";
    
    if (key) {
        const act = state.activities.find(a => a.key === key);
        imageUrl = act.image;
    }
    
    if (file) {
        const snapshot = await storage.ref(`activity/${file.name}`).put(file);
        imageUrl = await snapshot.ref.getDownloadURL();
    }
    
    if (!imageUrl) {
        alert("Selecione uma imagem!");
        return;
    }
    
    const payload = {
        title, 
        description: desc,
        points,
        pointsDesc,
        categories,
        image: imageUrl
    };
    
    if (key) {
        await db.ref(`activities/${key}`).update(payload);
    } else {
        await db.ref('activities').push(payload);
    }
    
    closeModal('modalActivity');
}


// **********************************************
// USERS MODULE
// **********************************************
function loadUsers() {
    db.ref('users').on('value', snapshot => {
        const data = snapshot.val();
        console.log('Raw Firebase Users Data:', data);
        state.users = [];
        for (let key in data) {
            state.users.push({
                key: key,
                ...data[key]
            });
        }
        console.log('Processed State Users:', state.users);
        renderUsersTable();
        updateDashboardStats();
    });
}

function renderUsersTable() {
    const container = document.getElementById('usersTableContainer');
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    const teamFilter = document.getElementById('filterUserTeam').value;
    
    const filtered = state.users.filter(u => {
        const matchesSearch = (u.name || "").toLowerCase().includes(searchTerm) || (u.email || "").toLowerCase().includes(searchTerm);
        const matchesTeam = teamFilter === "all" || String(u.team) === teamFilter;
        return matchesSearch && matchesTeam;
    });
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th><input type="checkbox" onchange="toggleSelectAllUsers(this)"></th>
                    <th>Foto</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Equipe</th>
                    <th>Veteran</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    filtered.forEach(u => {
        // Safe access to team name with fallback
        const teamObj = state.teams[u.team - 1]; // Assuming DB uses 1-based IDs
        const teamName = teamObj ? teamObj.name : `Equipe ${u.team}`;
        
        html += `
            <tr>
                <td><input type="checkbox" class="user-checkbox" value="${u.key}" onchange="checkBulkDeleteUsers()"></td>
                <td><img src="${u.photo || 'files/image/unknownUser.webp'}" class="small-thumb" style="border-radius:50%"></td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${teamName}</td>
                <td>${u.veteran ? '<span title="Veterano">⭐</span>' : ''}</td>
                <td>
                    <button class="btn btn-primary" style="padding:5px 10px; display:inline-flex;" onclick="openEditUserModal('${u.key}')">
                        <i class="material-icons" style="margin:0; font-size:16px;">edit</i>
                    </button>
                    <button class="btn btn-danger" style="padding:5px 10px; display:inline-flex;" onclick="deleteUser('${u.key}')">
                        <i class="material-icons" style="margin:0; font-size:16px;">delete</i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

document.getElementById('searchUsers').addEventListener('input', renderUsersTable);
document.getElementById('filterUserTeam').addEventListener('change', renderUsersTable);

function toggleSelectAllUsers(source) {
    document.querySelectorAll('.user-checkbox').forEach(cb => {
        cb.checked = source.checked;
    });
    checkBulkDeleteUsers();
}

function checkBulkDeleteUsers() {
    const count = document.querySelectorAll('.user-checkbox:checked').length;
    document.getElementById('btnBulkDeleteUsers').disabled = count === 0;
}

function bulkDeleteUsers() {
     if(!confirm("Tem certeza que deseja deletar os usuários selecionados?")) return;
    
    const checkboxes = document.querySelectorAll('.user-checkbox:checked');
    checkboxes.forEach(cb => {
        deleteUser(cb.value, true);
    });
}

function deleteUser(key, skipConfirm) {
    if (!skipConfirm && !confirm("Deletar este usuário?")) return;
    db.ref(`users/${key}`).remove();
}

// --- EDIT USER ---
function openEditUserModal(userKey) {
    const user = state.users.find(u => u.key === userKey);
    if (!user) return;

    document.getElementById('editUserKey').value = userKey;
    document.getElementById('editUserName').value = user.name || "";
    document.getElementById('editUserEmail').value = user.email || "";
    document.getElementById('editUserVeteran').checked = !!user.veteran;
    
    // Populate dropdown if empty (should check)
    const select = document.getElementById('editUserTeam');
    if(select.options.length === 0) {
         state.teams.forEach((t, i) => {
            const option = document.createElement('option');
            option.value = i + 1;
            option.text = t.name;
            select.add(option);
        });
    }
    
    if (user.team) {
        select.value = user.team;
    }
    
    document.getElementById('modalEditUser').classList.add('open');
}

function saveUserEdit() {
    const key = document.getElementById('editUserKey').value;
    const name = document.getElementById('editUserName').value;
    const email = document.getElementById('editUserEmail').value;
    const team = parseInt(document.getElementById('editUserTeam').value);
    const veteran = document.getElementById('editUserVeteran').checked;

    if(!name || !email) {
        alert("Preencha os campos obrigatórios.");
        return;
    }
    
    db.ref(`users/${key}`).update({
        name,
        email,
        team,
        veteran
    }).then(() => {
        closeModal('modalEditUser');
        alert("Usuário atualizado!");
    });
}


// **********************************************
// POSTS MODULE
// **********************************************
function loadPosts() {
    db.ref('posts').on('value', snapshot => {
        const data = snapshot.val();
        state.posts = [];
        for (let key in data) {
            state.posts.push({ key, ...data[key] });
        }
        renderPosts();
        updateDashboardStats();
    });
}

function renderPosts() {
    const container = document.getElementById('postsContainer');
    let html = '';
    
    const sortedPosts = [...state.posts].sort((a,b) => b.date - a.date);

    sortedPosts.forEach(post => {
        const date = new Date(post.date).toLocaleDateString();
        html += `
            <div class="card2" style="background:white; padding:20px; border-radius:8px; margin-bottom:15px; box-shadow:0 2px 5px rgba(0,0,0,0.1)">
                <div style="display:flex; justify-content:space-between">
                    <h3>${post.title}</h3>
                    <small>${date}</small>
                </div>
                <p>${post.content}</p>
                 <button class="btn btn-danger" style="padding: 5px 10px; font-size:12px; margin-top:10px" onclick="deletePost('${post.key}')">Excluir</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function openAddPostModal() {
    document.getElementById('modalPost').classList.add('open');
}

function sendPost() {
    const title = document.getElementById('postTitleInput').value;
    const content = document.getElementById('postContentInput').value;
    
    if(title && content) {
        db.ref('posts').push({
            title, content, date: Date.now()
        });
        closeModal('modalPost');
        document.getElementById('postTitleInput').value = "";
        document.getElementById('postContentInput').value = "";
    }
}

function deletePost(key) {
     if(confirm("Excluir post?")) db.ref(`posts/${key}`).remove();
}


// **********************************************
// SETTINGS MODULE
// **********************************************
function loadSettings() {
    db.ref("settings").on("value", snapshot => {
        const s = snapshot.val();
        if(s) {
            document.getElementById("ajustes1").checked = s.allow_send;
            document.getElementById("ajustes2").checked = s.login;
            document.getElementById("ajustes3").checked = s.we_have_a_winner;
            document.getElementById("ajustes4").checked = s.showSchedule;
        }
    });
    
    setupSettingListener("ajustes1", "allow_send");
    setupSettingListener("ajustes2", "login");
    setupSettingListener("ajustes3", "we_have_a_winner");
    setupSettingListener("ajustes4", "showSchedule");
}

function setupSettingListener(id, dbKey) {
    const el = document.getElementById(id);
    if(el) {
        el.addEventListener('change', function() {
            db.ref("settings").update({ [dbKey]: this.checked });
        });
    }
}


// **********************************************
// SCHEDULE MODULE
// **********************************************
let currentEventKey = null;
let currentEventType = 0;

function loadSchedule() {
    // Initial empty render
    renderEmptyScheduleTable();
    
    db.ref('schedule').on('value', snapshot => {
        renderEmptyScheduleTable(); // Clear before re-rendering
        snapshot.forEach(child => {
            renderScheduleItem(child.key, child.val());
        });
    });
}

function renderEmptyScheduleTable() {
    const table = document.getElementById('table');
    table.innerHTML = `
        <tr>
            <th style="width:5vw;">Horário</th>
            <th>Segunda</th>
            <th>Terça</th>
            <th>Quarta</th>
            <th>Quinta</th>
            <th>Sexta</th>
        </tr>
    `;
    
    let hour = 7;
    let min = 30;
    
    for (let i = 0; i < 31; i++) {
        const tr = document.createElement('tr');
        const timeTd = document.createElement('td');
        const timeStr = `${hour}h${min===0 ? '00' : min}`;
        timeTd.innerText = timeStr;
        tr.appendChild(timeTd);
        
        for (let j = 0; j < 5; j++) {
            const td = document.createElement('td');
            td.id = `${i}/${j}`;
            tr.appendChild(td);
        }
        
        table.appendChild(tr);
        
        // Increment time
        min += 30;
        if (min === 60) { min = 0; hour++; }
    }
}

function renderScheduleItem(key, event) {
    const row = event.start_time;
    const col = event.week_day;
    const duration = event.end_time - event.start_time;
    
    const cell = document.getElementById(`${row}/${col}`);
    if (cell) {
        cell.innerHTML = event.title;
        cell.rowSpan = duration + 1;
        cell.className = `hasContent mode${event.type}`;
        cell.onclick = () => openEditEventModal(key, event);
        
        // Hide covered cells
        for (let k = 1; k <= duration; k++) {
            const nextRow = parseInt(row) + k;
            const coveredCell = document.getElementById(`${nextRow}/${col}`);
            if (coveredCell) coveredCell.style.display = 'none';
        }
    }
}

function openAddEventModal() {
    currentEventKey = null;
    selectEventType(0);
    document.getElementById('eventTitle').value = "";
    document.getElementById('eventDescription').value = "";
    document.getElementById('eventLocation').value = "";
    document.getElementById('btnDeleteEvent').style.display = 'none';
    
    document.getElementById('modalEvent').classList.add('open');
}

function openEditEventModal(key, event) {
    currentEventKey = key;
    selectEventType(event.type);
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDescription').value = event.desc || "";
    document.getElementById('eventLocation').value = event.location || "";
    document.getElementById('eventDate').value = event.week_day;
    document.getElementById('startTime').value = event.start_time;
    document.getElementById('endTime').value = event.end_time;
    
    document.getElementById('btnDeleteEvent').style.display = 'block';
    document.getElementById('modalEvent').classList.add('open');
}

function selectEventType(type) {
    currentEventType = type;
    document.querySelectorAll('.cube').forEach(c => c.classList.remove('selected'));
    document.getElementById(`type${type}`).classList.add('selected');
    
    const colors = ["#5BB974", "#F1F3F4", "#FBBC04", "#F27405", "#FAD2CF", "#174EA6", "#ff4646"];
    document.getElementById('modalImage').style.backgroundColor = colors[type];
    document.getElementById('modalImage').style.backgroundImage = `url('./files/image/bg${type}.svg')`;
}

function saveEventEdit() {
    const payload = {
        title: document.getElementById('eventTitle').value,
        desc: document.getElementById('eventDescription').value,
        week_day: document.getElementById('eventDate').value,
        start_time: document.getElementById('startTime').value,
        end_time: document.getElementById('endTime').value,
        location: document.getElementById('eventLocation').value,
        type: currentEventType
    };
    
    if(currentEventKey) {
        db.ref(`schedule/${currentEventKey}`).update(payload);
    } else {
        db.ref('schedule').push(payload);
    }
    closeModal('modalEvent');
}

function deleteEvent() {
    if(currentEventKey && confirm("Excluir evento?")) {
        db.ref(`schedule/${currentEventKey}`).remove();
        closeModal('modalEvent');
    }
}
function clearSchedule() {
    if(prompt("Digite 'confirmar' para apagar TUDO") === "confirmar") {
        db.ref('schedule').remove();
    }
}


// **********************************************
// Shared Modal Utilities
// **********************************************
function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

// Stats & Dashboard Updater
function updateDashboardStats() {
    if(document.getElementById('totalTeams')) 
        document.getElementById('totalTeams').innerText = state.teams.length;
    if(document.getElementById('totalUsers'))
        document.getElementById('totalUsers').innerText = state.users.length;
    if(document.getElementById('totalActivities'))
        document.getElementById('totalActivities').innerText = state.activities.length;
    
    renderScoreboard();
    renderUpdates();
}

function renderScoreboard() {
    const container = document.getElementById('scoreboardList');
    if(!container) return; 

    const sortedTeams = [...state.teams].sort((a,b) => b.points - a.points);
    
    let html = '';
    sortedTeams.slice(0, 5).forEach((team, index) => { 
        const rankClass = index < 3 ? `rank-${index+1}` : '';
        html += `
            <div class="scoreboard-item">
                <span class="rank-number ${rankClass}">${index+1}</span>
                <span class="score-name">${team.name}</span>
                <span class="score-points">${team.points} pts</span>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p style="color:#888; text-align:center">Nenhuma equipe registrada</p>';
}

function renderUpdates() {
    const container = document.getElementById('updatesList');
    if(!container) return;
    
    const sortedPosts = [...state.posts].sort((a,b) => b.date - a.date);
    
    let html = '';
    sortedPosts.slice(0, 5).forEach(post => {
        const date = new Date(post.date).toLocaleDateString();
        html += `
            <div class="update-item">
                <span class="update-date">${date}</span>
                ${post.title}
            </div>
        `;
    });
    
    container.innerHTML = html || '<p style="color:#888; text-align:center">Nenhuma atualização recente</p>';
}

// **********************************************
// MOBILE SIDEBAR
// **********************************************
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function closeSidebar() {
    document.querySelector('.sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

// Close sidebar when clicking a menu item on mobile
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        if(window.innerWidth <= 768) {
            closeSidebar();
        }
    });
});

// **********************************************
// DATA MANAGEMENT
// **********************************************
function clearAllTeamsData(event) {
    console.log("clearAllTeamsData called");
    if(event) {
        event.stopPropagation();
        event.preventDefault();
    }

    // Safety check for elements
    const input = document.getElementById('confirmClearInput');
    const modal = document.getElementById('modalConfirmClear');
    
    if(!input || !modal) {
        console.error("Critical Error: Modal elements not found in DOM.");
        alert("Erro interno: O modal de confirmação não foi carregado corretamente. Por favor, recarregue a página.");
        return;
    }

    // Reset input and open modal
    input.value = '';
    modal.classList.add('open');
}

function executeClearData() {
    const confirmation = document.getElementById('confirmClearInput').value;
    
    if (confirmation !== 'LIMPAR') {
        alert("A confirmação está incorreta. Digite LIMPAR (em maiúsculas).");
        return;
    }

    const updates = {};
    if (state.teams) {
        Object.keys(state.teams).forEach(key => {
             updates[`teams/${key}/points`] = 0;
             updates[`teams/${key}/tasks`] = null;
        });
    }
    
    db.ref().update(updates)
        .then(() => {
            alert("DADOS LIMPOS COM SUCESSO.");
            closeModal('modalConfirmClear');
        })
        .catch(error => alert("Erro ao limpar dados: " + error.message));
}