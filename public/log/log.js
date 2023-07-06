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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
}

// State Management
let allLogs = [];
let filteredLogs = [];
let backendApproved = [];
let backendRejected = [];
let currentFilter = 'all'; // 'all', 'approved', 'rejected'
let currentTeamFilter = 'all'; // 'all' or team ID
let currentPage = 1;
const PAGE_SIZE = 10;

// Main Fetch Function
function getInfo() {
    const db = firebase.database();
    
    // Fetch logs
    const p1 = db.ref('approved').limitToLast(200).once('value');
    const p2 = db.ref('rejected').limitToLast(200).once('value');
    // Fetch teams for dropdown
    const p3 = db.ref('teams').once('value');

    Promise.all([p1, p2, p3]).then(snapshots => {
        const approvedSnap = snapshots[0];
        const rejectedSnap = snapshots[1];
        const teamsSnap = snapshots[2];

        // Process Teams
        populateTeamFilter(teamsSnap);

        // Process Logs
        backendApproved = [];
        backendRejected = [];

        if (approvedSnap.exists()) {
            approvedSnap.forEach(child => {
                const val = child.val();
                backendApproved.push({
                    ...val,
                    status: 'approved',
                    key: child.key
                });
            });
        }

        if (rejectedSnap.exists()) {
            rejectedSnap.forEach(child => {
                const val = child.val();
                backendRejected.push({
                    ...val,
                    status: 'rejected',
                    reason: val.reason || "Motivos não registrados",
                    key: child.key
                });
            });
        }

        combineAndSort();
        applyFilter();
    });
}

function populateTeamFilter(snapshot) {
    const select = document.getElementById('teamFilter');
    if (!snapshot.exists()) return;

    snapshot.forEach(child => {
        const team = child.val();
        const option = document.createElement('option');
        // Assuming team ID logic matches: ID is key (e.g. "0", "1") -> Team 1, Team 2
        // Logs store team as 1-based usually? Let's check logic.
        // In createCard: teamId = item.team. DB fetch: teams/(teamId-1).
        // So item.team is 1-based index (1..16).
        // The teams DB keys are "0".."15".
        // So value of option should be the 1-based ID to match item.team easily?
        // Let's use the 1-based ID as value to match item.team directly.
        
        const dbIndex = parseInt(child.key);
        const teamId = dbIndex + 1; 

        option.value = teamId;
        option.textContent = team.name;
        select.appendChild(option);
    });
}

function combineAndSort() {
    allLogs = [...backendApproved, ...backendRejected];
    // Sort descending by date
    allLogs.sort((a, b) => b.date - a.date);
}

function setFilter(type) {
    currentFilter = type;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if(btn.getAttribute('onclick').includes(`'${type}'`)) {
           btn.classList.add('active');
       } else {
           btn.classList.remove('active');
       }
    });

    currentPage = 1; // Reset to first page
    applyFilter();
}

function filterByTeam(teamId) {
    currentTeamFilter = teamId; // "all" or string number "1"
    currentPage = 1;
    applyFilter();
}

function applyFilter() {
    // 1. Filter by Status
    let temp = [];
    if (currentFilter === 'all') {
        temp = allLogs;
    } else if (currentFilter === 'approved') {
        temp = backendApproved.sort((a,b) => b.date - a.date);
    } else {
        temp = backendRejected.sort((a,b) => b.date - a.date);
    }

    // 2. Filter by Team
    if (currentTeamFilter !== 'all') {
        // item.team is number or string? backend data usually numbers. 
        // filter value is string. loose comparison needed.
        temp = temp.filter(item => item.team == currentTeamFilter);
    }
    
    // Sort again to be safe (though usually stable)
    temp.sort((a, b) => b.date - a.date);

    filteredLogs = temp;
    renderLogs();
}

function changePage(pageNum) {
    if (pageNum < 1) return;
    const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
    if (pageNum > totalPages && totalPages > 0) return;

    currentPage = pageNum;
    renderLogs();
}

function renderLogs() {
    const container = document.getElementById('logFeed');
    const paginationContainer = document.getElementById('paginationControls');
    
    container.innerHTML = ''; 
    paginationContainer.innerHTML = '';

    if (filteredLogs.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum registro encontrado.</div>';
        return;
    }

    // Calculate Pagination
    const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
    
    // Clamp current page
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    
    const toShow = filteredLogs.slice(startIndex, endIndex);
    
    toShow.forEach(item => {
        const card = createCard(item);
        container.appendChild(card);
    });

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const container = document.getElementById('paginationControls');
    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="material-icons">chevron_left</i>';
    prevBtn.onclick = () => changePage(currentPage - 1);
    if (currentPage === 1) prevBtn.disabled = true;
    container.appendChild(prevBtn);

    // Page Numbers (Simple logic: Show all if < 7, otherwise smart truncate?)
    // For simplicity given ~200 items -> ~20 pages. Let's show a sliding window.
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Adjust window needed
    if (startPage <= 2) endPage = Math.min(totalPages, 5);
    if (endPage >= totalPages - 1) startPage = Math.max(1, totalPages - 4);

    if (startPage > 1) {
         addPageButton(1, container);
         if (startPage > 2) addEllipsis(container);
    }

    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i, container);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) addEllipsis(container);
        addPageButton(totalPages, container);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="material-icons">chevron_right</i>';
    nextBtn.onclick = () => changePage(currentPage + 1);
    if (currentPage === totalPages) nextBtn.disabled = true;
    container.appendChild(nextBtn);
}

function addPageButton(pageNum, container) {
    const btn = document.createElement('button');
    btn.className = `page-btn ${pageNum === currentPage ? 'active' : ''}`;
    btn.textContent = pageNum;
    btn.onclick = () => changePage(pageNum);
    container.appendChild(btn);
}

function addEllipsis(container) {
    const span = document.createElement('span');
    span.className = 'page-ellipsis';
    span.textContent = '...';
    container.appendChild(span);
}

function createCard(item) {
    const div = document.createElement('div');
    div.className = `li card-content status-${item.status}`; 
    // Add border-left color for team logic later
    
    // Main Container for Flebox
    const mainContainer = document.createElement('div');
    mainContainer.className = 'card-main-container';
    div.appendChild(mainContainer);

    // --- Left Side: Activity Icon ---
    const iconContainer = document.createElement('div');
    iconContainer.className = 'card-icon-container';
    const activityImg = document.createElement('img');
    activityImg.className = 'card-activity-icon';
    // Default placeholder or empty until loaded
    activityImg.src = 'files/image/CAQUI.webp'; 
    iconContainer.appendChild(activityImg);
    mainContainer.appendChild(iconContainer);

    // --- Right Side: Content ---
    const contentContainer = document.createElement('div');
    contentContainer.className = 'card-info-container';
    mainContainer.appendChild(contentContainer);

    // 1. Header (Badge + Date)
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const statusLabel = item.status === 'approved' ? 
        '<span class="badge approved">Aprovada</span>' : 
        '<span class="badge rejected">Recusada</span>';
    
    const dateObj = new Date(item.date);
    const relativeTime = timeSince(dateObj);
    const fullDate = dateObj.toLocaleString();

    header.innerHTML = `
        ${statusLabel}
        <span class="card-date" title="${fullDate}">${relativeTime}</span>
    `;
    contentContainer.appendChild(header);

    // 2. Activity Title
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = "Carregando atividade..."; 
    contentContainer.appendChild(title);

    // 3. User & Team
    const meta = document.createElement('div');
    meta.className = 'card-meta';
    
    const userSpan = document.createElement('span');
    userSpan.textContent = "Usuário...";
    const teamSpan = document.createElement('span');
    teamSpan.className = 'team-info';
    
    meta.appendChild(userSpan);
    meta.appendChild(teamSpan);
    contentContainer.appendChild(meta);

    // 4. Reason (if rejected)
    if (item.status === 'rejected') {
        const reasonDiv = document.createElement('div');
        reasonDiv.className = 'card-reason';
        reasonDiv.innerHTML = `<strong>Motivo:</strong> ${item.reason}`;
        contentContainer.appendChild(reasonDiv);
    }

    // --- Async Data Fetching ---
    // Fetch Activity Title & Image
    firebase.database().ref('activities/' + item.activity).once('value').then(snap => {
        if(snap.val()) {
            title.textContent = snap.val().title;
            if (snap.val().image) {
                activityImg.src = snap.val().image;
            }
        }
        else title.textContent = "Atividade " + item.activity;
    });

    // Fetch User Name
    firebase.database().ref('users/' + item.userId).once('value').then(snap => {
        if(snap.val()) userSpan.textContent = snap.val().name;
        else userSpan.textContent = "Usuário Desconhecido";
    });

    // Fetch Team Name & Color & Icon
    let teamId = item.team;
    
    if (teamId) {
        // Team Icon (Local file based on ID)
        const teamIconUrl = `files/teams/${teamId}.webp`;

        firebase.database().ref('teams/' + (teamId - 1)).once('value').then(snap => {
            if(snap.val()) {
                // Team HTML with Icon
                teamSpan.innerHTML = ` • <img src="${teamIconUrl}" class="card-team-icon" alt="Team Icon"> ${snap.val().name}`;
                
                // Add a colored border or accent logic
                div.style.borderLeft = `5px solid ${snap.val().color}`;
            }
        });
    }

    return div;
}

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return "Há " + Math.floor(interval) + " anos";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return "Há " + Math.floor(interval) + " meses";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return "Há " + Math.floor(interval) + " dias";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return "Há " + Math.floor(interval) + "h";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return "Há " + Math.floor(interval) + " min";
  }
  return "Agora mesmo";
}


// --- Standard Page Logic (Auth, Menu, etc.) --- 
// Copied and adapted from original file

headerShadow();

function headerShadow() {
  const header = document.getElementById("header");
  if (!header) return;
  if (document.body.scrollTop == 0 || document.documentElement.scrollTop == 0) {
    header.className = "headerNoShadow";
  } else {
    header.className = "";
  }
}

var popupShow = false;

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

    window.onclick = function (event) {
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
  loadAuthData();
}

function loadAuthData() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            document.getElementById('userName').innerHTML = user.displayName;
            document.getElementById('userEmail').innerHTML = user.email;
            document.getElementById("userPhoto").style.backgroundImage = "url('" + user.photoURL + "')";
        }
    });
}
function signOut() {
  firebase.auth().signOut().then(() => location.reload());
}

var menuOpen = false;
function openMenu() {
  const menu = document.getElementById("menu");
  const menuHolder = document.getElementById("menuHolder");
  const sandwich = document.getElementById("sandwich");

  if (menuOpen == false) {
    menu.className = "show";
    menuHolder.className = "shadow"
    window.onclick = function (event) {
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
   getInfo(); // Start fetching data
   loadAuthData();
   
   // Settings check
    var db = firebase.database();
	var ref = db.ref("settings");
	ref.on("value", function (snapshot) {
		var data = snapshot.val();
		if (data && data.showSchedule == false) {
            const el = document.getElementById("scheduleNav");
			if(el) el.style.display = "none";
		}
	});
}