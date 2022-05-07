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

// 404 text animation

if (window.innerWidth < 500) {
    document.getElementById('canvas').style.display = 'none';
    document.getElementById('image').style.display = 'block';
} else {
    document.getElementById('image').style.display = 'none';
}

// The following code is from: https://codepen.io/tholman/pen/AmptL (modified)

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var Nodes = {

  // Settings
  density: Math.round(window.innerWidth / 60),
  width: window.innerWidth/1.2,
  height: window.innerHeight/1.2,

  drawDistance: Math.round(window.innerWidth / 50),
  baseRadius: Math.round(window.innerWidth / 250),
  maxLineThickness: 4,
  reactionSensitivity: Math.round(window.innerWidth / 300),
  lineThickness: 1,

  points: [],
  mouse: { x: -1000, y: -1000, down: false },

  animation: null,

  canvas: null,
  context: null,

  imageInput: null,
  bgImage: null,
  bgCanvas: null,
  bgContext: null,
  bgContextPixelData: null,

  init: function() {
    // Set up the visual canvas
    this.canvas = document.getElementById( 'canvas' );
    this.context = canvas.getContext( '2d' );
    this.context.globalCompositeOperation = "lighter";
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.imageInput = document.createElement( 'input' );
    this.imageInput.setAttribute( 'type', 'file' );
    this.imageInput.style.visibility = 'hidden';
    this.imageInput.addEventListener('change', this.upload, false);
    document.body.appendChild( this.imageInput );

    this.canvas.addEventListener('mousemove', this.mouseMove, false);
    this.canvas.addEventListener('mousedown', this.mouseDown, false);
    this.canvas.addEventListener('mouseup',   this.mouseUp,   false);
    this.canvas.addEventListener('mouseout',  this.mouseOut,  false);

    window.onresize = function(event) {
      Nodes.canvas.width = window.innerWidth /1.2;
      Nodes.canvas.height = window.innerHeight /1.2;
      Nodes.density = Math.round(window.innerWidth / 60);
      Nodes.drawDistance = Math.round(window.innerWidth / 50);
      Nodes.baseRadius = Math.round(window.innerWidth / 250);
      Nodes.reactionSensitivity = Math.round(window.innerWidth / 300);
      Nodes.onWindowResize();
    }

    // Load initial input image
    this.loadData( 'data:image/png;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJg9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmD0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIBHK6X8A+tsGfT7YsM4AAAAAElFTkSuQmCC');
  },

  preparePoints: function() {

    // Clear the current points
    this.points = [];

    var width, height, i, j;

    var colors = this.bgContextPixelData.data;

    for( i = 0; i < this.canvas.height; i += this.density ) {

      for ( j = 0; j < this.canvas.width; j += this.density ) {

        var pixelPosition = ( j + i * this.bgContextPixelData.width ) * 4;

        // Dont use whiteish pixels
        if ( colors[pixelPosition] > 200 && (colors[pixelPosition + 1]) > 200 && (colors[pixelPosition + 2]) > 200 || colors[pixelPosition + 3] === 0 ) {
          continue;
        }

        var color = 'rgba(' + colors[pixelPosition] + ',' + colors[pixelPosition + 1] + ',' + colors[pixelPosition + 2] + ',' + '1)';
        this.points.push( { x: j, y: i, originalX: j, originalY: i, color: color } );

      }
    }
  },

  updatePoints: function() {

    var i, currentPoint, theta, distance;

    for (i = 0; i < this.points.length; i++ ){

      currentPoint = this.points[i];

      theta = Math.atan2( currentPoint.y - this.mouse.y, currentPoint.x - this.mouse.x);

      if ( this.mouse.down ) {
        distance = this.reactionSensitivity * 200 / Math.sqrt((this.mouse.x - currentPoint.x) * (this.mouse.x - currentPoint.x) +
         (this.mouse.y - currentPoint.y) * (this.mouse.y - currentPoint.y));
      } else {
        distance = this.reactionSensitivity * 100 / Math.sqrt((this.mouse.x - currentPoint.x) * (this.mouse.x - currentPoint.x) +
         (this.mouse.y - currentPoint.y) * (this.mouse.y - currentPoint.y));
      }


      currentPoint.x += Math.cos(theta) * distance + (currentPoint.originalX - currentPoint.x) * 0.05;
      currentPoint.y += Math.sin(theta) * distance + (currentPoint.originalY - currentPoint.y) * 0.05;

    }
  },

  drawLines: function() {

    var i, j, currentPoint, otherPoint, distance, lineThickness;

    for ( i = 0; i < this.points.length; i++ ) {

      currentPoint = this.points[i];

      // Draw the dot.
      this.context.fillStyle = currentPoint.color;
      this.context.strokeStyle = currentPoint.color;

      for ( j = 0; j < this.points.length; j++ ){

        // Distaqnce between two points.
        otherPoint = this.points[j];

        if ( otherPoint == currentPoint ) {
          continue;
        }

        distance = Math.sqrt((otherPoint.x - currentPoint.x) * (otherPoint.x - currentPoint.x) +
         (otherPoint.y - currentPoint.y) * (otherPoint.y - currentPoint.y));

        if (distance <= this.drawDistance) {

          this.context.lineWidth = (1 - (distance / this.drawDistance)) * this.maxLineThickness * this.lineThickness;
          this.context.beginPath();
          this.context.moveTo(currentPoint.x, currentPoint.y);
          this.context.lineTo(otherPoint.x, otherPoint.y);
          this.context.stroke();
        }
      }
    }
  },

  drawPoints: function() {

    var i, currentPoint;

    for ( i = 0; i < this.points.length; i++ ) {

      currentPoint = this.points[i];

      // Draw the dot.
      this.context.fillStyle = currentPoint.color;
      this.context.strokeStyle = currentPoint.color;

      this.context.beginPath();
      this.context.arc(currentPoint.x, currentPoint.y, this.baseRadius ,0 , Math.PI*2, true);
      this.context.closePath();
      this.context.fill();

    }
  },

  draw: function() {
    this.animation = requestAnimationFrame( function(){ Nodes.draw() } );

    this.clear();
    this.updatePoints();
    this.drawLines();
    this.drawPoints();

  },

  clear: function() {
    this.canvas.width = this.canvas.width;
  },

  // The filereader has loaded the image... add it to image object to be drawn
  loadData: function( data ) {

    this.bgImage = new Image;
    this.bgImage.src = data;

    this.bgImage.onload = function() {

      //this
      Nodes.drawImageToBackground();
    }
  },

  // Image is loaded... draw to bg canvas
  drawImageToBackground: function () {

    this.bgCanvas = document.createElement( 'canvas' );
    this.bgCanvas.width = this.canvas.width;
    this.bgCanvas.height = this.canvas.height;

    var newWidth, newHeight;

    // If the image is too big for the screen... scale it down.
    if ( this.bgImage.width > this.bgCanvas.width - 100 || this.bgImage.height > this.bgCanvas.height - 100) {

      var maxRatio = Math.max( this.bgImage.width / (this.bgCanvas.width - 100) , this.bgImage.height / (this.bgCanvas.height - 100) );
      newWidth = this.bgImage.width / maxRatio;
      newHeight = this.bgImage.height / maxRatio;

    } else {
      newWidth = this.bgImage.width;
      newHeight = this.bgImage.height;
    }

    // Draw to background canvas
    this.bgContext = this.bgCanvas.getContext( '2d' );
    this.bgContext.drawImage( this.bgImage, (this.canvas.width - newWidth) / 2, (this.canvas.height - newHeight) / 2, newWidth, newHeight);
    this.bgContextPixelData = this.bgContext.getImageData( 0, 0, this.bgCanvas.width, this.bgCanvas.height );

    this.preparePoints();
    this.draw();
  },

  mouseDown: function( event ){
    Nodes.mouse.down = true;
  },

  mouseUp: function( event ){
    Nodes.mouse.down = false;
  },

  mouseMove: function(event){
    Nodes.mouse.x = event.offsetX || (event.layerX - Nodes.canvas.offsetLeft);
    Nodes.mouse.y = event.offsetY || (event.layerY - Nodes.canvas.offsetTop);
  },

  mouseOut: function(event){
    Nodes.mouse.x = -1000;
    Nodes.mouse.y = -1000;
    Nodes.mouse.down = false;
  },

  // Resize and redraw the canvas.
  onWindowResize: function() {
    cancelAnimationFrame( this.animation );
    this.drawImageToBackground();
  }
}

  setTimeout( function() {
    Nodes.init();
}, 10 );

// Default code

headerShadow();
function headerShadow() {
	if (document.body.scrollTop == 0 || document.documentElement.scrollTop == 0){
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

var team;

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

      // Define team
      const currentUser = firebase.auth().currentUser;
      var dbRef = firebase.database().ref('users/' + currentUser.uid + "/team");
      dbRef.on('value', function(snapshot) {
        team = snapshot.val();
        // defineBgColor(team); Still haven't decided if this will be kept
      });
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
