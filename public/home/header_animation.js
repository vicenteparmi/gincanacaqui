/*
  Molecular Interaction Animation
  Simulates molecules that can bond together and break apart on collision
*/

// Canvas setup
var canvas = document.getElementById('canvas');
var CANVAS_WIDTH = window.innerWidth;
var CANVAS_HEIGHT = window.innerWidth > 500 
  ? window.innerHeight * 0.66 
  : window.innerHeight * 0.40;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
var ctx = canvas.getContext('2d');

// Configuration
var CONFIG = {
  BOND_ENERGY_THRESHOLD: 300,
  BOND_PROBABILITY: 0.85,
  MOLECULE_COLORS: ['#ffc999', '#ffad66', '#ff9f4d', '#ffbe80']
};

// Molecule class
function Molecule(x, y, vx, vy, radius) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.radius = radius;
  this.mass = radius * radius;
  this.color = CONFIG.MOLECULE_COLORS[Math.floor(Math.random() * CONFIG.MOLECULE_COLORS.length)];
  this.bondedTo = null;
}

Molecule.prototype.draw = function() {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
  ctx.fillStyle = this.color;
  ctx.fill();
};

Molecule.prototype.isBonded = function() {
  return this.bondedTo !== null;
};

// Bond class - conserves total kinetic energy
function Bond(mol1, mol2) {
  this.mol1 = mol1;
  this.mol2 = mol2;
  this.angle = Math.atan2(mol2.y - mol1.y, mol2.x - mol1.x);
  this.distance = mol1.radius + mol2.radius;
  
  // Store total kinetic energy before bonding
  var ke1 = 0.5 * mol1.mass * (mol1.vx * mol1.vx + mol1.vy * mol1.vy);
  var ke2 = 0.5 * mol2.mass * (mol2.vx * mol2.vx + mol2.vy * mol2.vy);
  this.totalEnergy = ke1 + ke2;
  
  mol1.bondedTo = mol2;
  mol2.bondedTo = mol1;
  
  // Center of mass velocity (momentum conservation)
  var totalMass = mol1.mass + mol2.mass;
  this.vx = (mol1.mass * mol1.vx + mol2.mass * mol2.vx) / totalMass;
  this.vy = (mol1.mass * mol1.vy + mol2.mass * mol2.vy) / totalMass;
  
  // Translational kinetic energy of center of mass
  var translationalKE = 0.5 * totalMass * (this.vx * this.vx + this.vy * this.vy);
  
  // Remaining energy goes to rotation
  var rotationalKE = this.totalEnergy - translationalKE;
  
  // Moment of inertia: I = m1*d1² + m2*d2² where d1, d2 are distances from center of mass
  var d1 = this.distance * mol2.mass / totalMass;
  var d2 = this.distance * mol1.mass / totalMass;
  var momentOfInertia = mol1.mass * d1 * d1 + mol2.mass * d2 * d2;
  
  // ω = sqrt(2 * rotationalKE / I)
  if (rotationalKE > 0 && momentOfInertia > 0) {
    this.angularVelocity = Math.sqrt(2 * rotationalKE / momentOfInertia);
    // Preserve rotation direction from relative velocity
    var relVx = mol2.vx - mol1.vx;
    var relVy = mol2.vy - mol1.vy;
    var perpVel = -relVx * Math.sin(this.angle) + relVy * Math.cos(this.angle);
    if (perpVel < 0) this.angularVelocity = -this.angularVelocity;
  } else {
    this.angularVelocity = 0;
  }
  
  this.updateCenterOfMass();
}

Bond.prototype.updateCenterOfMass = function() {
  var totalMass = this.mol1.mass + this.mol2.mass;
  this.centerX = (this.mol1.mass * this.mol1.x + this.mol2.mass * this.mol2.x) / totalMass;
  this.centerY = (this.mol1.mass * this.mol1.y + this.mol2.mass * this.mol2.y) / totalMass;
};

Bond.prototype.update = function(dt) {
  this.angle += this.angularVelocity;
  this.centerX += this.vx * dt;
  this.centerY += this.vy * dt;
  
  var totalMass = this.mol1.mass + this.mol2.mass;
  var dist1 = this.distance * this.mol2.mass / totalMass;
  var dist2 = this.distance * this.mol1.mass / totalMass;
  
  this.mol1.x = this.centerX - Math.cos(this.angle) * dist1;
  this.mol1.y = this.centerY - Math.sin(this.angle) * dist1;
  this.mol2.x = this.centerX + Math.cos(this.angle) * dist2;
  this.mol2.y = this.centerY + Math.sin(this.angle) * dist2;
  
  this.mol1.vx = this.vx - this.angularVelocity * dist1 * Math.sin(this.angle);
  this.mol1.vy = this.vy + this.angularVelocity * dist1 * Math.cos(this.angle);
  this.mol2.vx = this.vx + this.angularVelocity * dist2 * Math.sin(this.angle);
  this.mol2.vy = this.vy - this.angularVelocity * dist2 * Math.cos(this.angle);
  
  this.handleWallCollisions();
};

Bond.prototype.handleWallCollisions = function() {
  var r1 = this.mol1.radius;
  var r2 = this.mol2.radius;
  var maxR = Math.max(r1, r2);
  
  if (this.mol1.x - r1 < 0 || this.mol2.x - r2 < 0) {
    this.vx = Math.abs(this.vx);
    this.centerX = Math.max(maxR + this.distance / 2, this.centerX);
  }
  if (this.mol1.x + r1 > CANVAS_WIDTH || this.mol2.x + r2 > CANVAS_WIDTH) {
    this.vx = -Math.abs(this.vx);
    this.centerX = Math.min(CANVAS_WIDTH - maxR - this.distance / 2, this.centerX);
  }
  if (this.mol1.y - r1 < 0 || this.mol2.y - r2 < 0) {
    this.vy = Math.abs(this.vy);
    this.centerY = Math.max(maxR + this.distance / 2, this.centerY);
  }
  if (this.mol1.y + r1 > CANVAS_HEIGHT || this.mol2.y + r2 > CANVAS_HEIGHT) {
    this.vy = -Math.abs(this.vy);
    this.centerY = Math.min(CANVAS_HEIGHT - maxR - this.distance / 2, this.centerY);
  }
};

Bond.prototype.draw = function() {
  this.mol1.draw();
  this.mol2.draw();
};

Bond.prototype.break = function() {
  // Distribute stored total energy back to molecules
  // Energy is split proportionally to mass (lighter molecule gets more speed)
  var totalMass = this.mol1.mass + this.mol2.mass;
  
  // Each molecule gets energy proportional to its share
  var ke1 = this.totalEnergy * this.mol2.mass / totalMass; // Lighter gets more
  var ke2 = this.totalEnergy * this.mol1.mass / totalMass;
  
  // Calculate speeds from kinetic energy: v = sqrt(2*KE/m)
  var speed1 = Math.sqrt(2 * ke1 / this.mol1.mass);
  var speed2 = Math.sqrt(2 * ke2 / this.mol2.mass);
  
  // Keep current direction but apply calculated speeds
  var currentSpeed1 = Math.sqrt(this.mol1.vx * this.mol1.vx + this.mol1.vy * this.mol1.vy);
  var currentSpeed2 = Math.sqrt(this.mol2.vx * this.mol2.vx + this.mol2.vy * this.mol2.vy);
  
  if (currentSpeed1 > 0.01) {
    this.mol1.vx = (this.mol1.vx / currentSpeed1) * speed1;
    this.mol1.vy = (this.mol1.vy / currentSpeed1) * speed1;
  } else {
    // If stationary, move away from each other
    var nx = Math.cos(this.angle);
    var ny = Math.sin(this.angle);
    this.mol1.vx = -nx * speed1;
    this.mol1.vy = -ny * speed1;
  }
  
  if (currentSpeed2 > 0.01) {
    this.mol2.vx = (this.mol2.vx / currentSpeed2) * speed2;
    this.mol2.vy = (this.mol2.vy / currentSpeed2) * speed2;
  } else {
    var nx = Math.cos(this.angle);
    var ny = Math.sin(this.angle);
    this.mol2.vx = nx * speed2;
    this.mol2.vy = ny * speed2;
  }
  
  this.mol1.bondedTo = null;
  this.mol2.bondedTo = null;
};

Bond.prototype.contains = function(mol) {
  return mol === this.mol1 || mol === this.mol2;
};

// Simulation class
function MolecularSimulation(moleculeCount, moleculeRadius) {
  this.molecules = [];
  this.bonds = [];
  this.generateMolecules(moleculeCount, moleculeRadius);
}

MolecularSimulation.prototype.generateMolecules = function(count, radius) {
  var attempts = 0;
  while (this.molecules.length < count && attempts < 1000) {
    var x = radius + Math.random() * (CANVAS_WIDTH - 2 * radius);
    var y = radius + Math.random() * (CANVAS_HEIGHT - 2 * radius);
    var vx = (Math.random() - 0.5) * 400;
    var vy = (Math.random() - 0.5) * 400;
    
    var mol = new Molecule(x, y, vx, vy, radius);
    var overlap = false;
    
    for (var i = 0; i < this.molecules.length; i++) {
      var other = this.molecules[i];
      var dx = mol.x - other.x;
      var dy = mol.y - other.y;
      var minDist = mol.radius + other.radius + 5;
      if (dx * dx + dy * dy < minDist * minDist) {
        overlap = true;
        break;
      }
    }
    
    if (!overlap) this.molecules.push(mol);
    attempts++;
  }
};

MolecularSimulation.prototype.update = function(dt) {
  // Update free molecules
  for (var i = 0; i < this.molecules.length; i++) {
    var mol = this.molecules[i];
    if (!mol.isBonded()) {
      mol.x += mol.vx * dt;
      mol.y += mol.vy * dt;
      
      // Wall collisions (elastic - no energy loss)
      if (mol.x - mol.radius < 0) {
        mol.x = mol.radius;
        mol.vx = Math.abs(mol.vx);
      }
      if (mol.x + mol.radius > CANVAS_WIDTH) {
        mol.x = CANVAS_WIDTH - mol.radius;
        mol.vx = -Math.abs(mol.vx);
      }
      if (mol.y - mol.radius < 0) {
        mol.y = mol.radius;
        mol.vy = Math.abs(mol.vy);
      }
      if (mol.y + mol.radius > CANVAS_HEIGHT) {
        mol.y = CANVAS_HEIGHT - mol.radius;
        mol.vy = -Math.abs(mol.vy);
      }
    }
  }
  
  // Update bonds
  for (var i = 0; i < this.bonds.length; i++) {
    this.bonds[i].update(dt);
  }
  
  this.handleCollisions();
};

MolecularSimulation.prototype.handleCollisions = function() {
  for (var i = 0; i < this.molecules.length; i++) {
    for (var j = i + 1; j < this.molecules.length; j++) {
      var mol1 = this.molecules[i];
      var mol2 = this.molecules[j];
      
      if (mol1.bondedTo === mol2) continue;
      
      var dx = mol2.x - mol1.x;
      var dy = mol2.y - mol1.y;
      var distSq = dx * dx + dy * dy;
      var minDist = mol1.radius + mol2.radius;
      
      if (distSq < minDist * minDist) {
        var dist = Math.sqrt(distSq);
        this.resolveCollision(mol1, mol2, dx, dy, dist);
      }
    }
  }
};

MolecularSimulation.prototype.resolveCollision = function(mol1, mol2, dx, dy, dist) {
  var nx = dx / dist;
  var ny = dy / dist;
  
  var dvx = mol2.vx - mol1.vx;
  var dvy = mol2.vy - mol1.vy;
  var dvn = dvx * nx + dvy * ny;
  
  if (dvn > 0) return;
  
  var impactSpeed = Math.abs(dvn);
  var impactEnergy = 0.5 * (mol1.mass + mol2.mass) * impactSpeed * impactSpeed;
  
  var mol1Bonded = mol1.isBonded();
  var mol2Bonded = mol2.isBonded();
  
  if (mol1Bonded || mol2Bonded) {
    if (mol1Bonded && impactEnergy > CONFIG.BOND_ENERGY_THRESHOLD) {
      this.breakBond(mol1);
    }
    if (mol2Bonded && impactEnergy > CONFIG.BOND_ENERGY_THRESHOLD) {
      this.breakBond(mol2);
    }
    this.elasticCollision(mol1, mol2, nx, ny, dvn);
  } else {
    // Check favorable collision angle
    var speed1 = Math.sqrt(mol1.vx * mol1.vx + mol1.vy * mol1.vy);
    var speed2 = Math.sqrt(mol2.vx * mol2.vx + mol2.vy * mol2.vy);
    
    var v1nx = speed1 > 0 ? mol1.vx / speed1 : 0;
    var v1ny = speed1 > 0 ? mol1.vy / speed1 : 0;
    var v2nx = speed2 > 0 ? mol2.vx / speed2 : 0;
    var v2ny = speed2 > 0 ? mol2.vy / speed2 : 0;
    
    var mol1TowardsMol2 = v1nx * nx + v1ny * ny;
    var mol2TowardsMol1 = -(v2nx * nx + v2ny * ny);
    var favorableCollision = mol1TowardsMol2 > 0.3 && mol2TowardsMol1 > 0.3;
    
    if (favorableCollision && Math.random() < CONFIG.BOND_PROBABILITY && this.bonds.length < this.molecules.length / 2) {
      this.bonds.push(new Bond(mol1, mol2));
    } else {
      this.elasticCollision(mol1, mol2, nx, ny, dvn);
    }
  }
  
  // Separate overlapping
  var overlap = (mol1.radius + mol2.radius) - dist;
  if (overlap > 0) {
    mol1.x -= nx * overlap * 0.5;
    mol1.y -= ny * overlap * 0.5;
    mol2.x += nx * overlap * 0.5;
    mol2.y += ny * overlap * 0.5;
  }
};

MolecularSimulation.prototype.elasticCollision = function(mol1, mol2, nx, ny, dvn) {
  var totalMass = mol1.mass + mol2.mass;
  var p = 2 * dvn / totalMass;
  mol1.vx += p * mol2.mass * nx;
  mol1.vy += p * mol2.mass * ny;
  mol2.vx -= p * mol1.mass * nx;
  mol2.vy -= p * mol1.mass * ny;
};

MolecularSimulation.prototype.breakBond = function(mol) {
  for (var i = this.bonds.length - 1; i >= 0; i--) {
    if (this.bonds[i].contains(mol)) {
      this.bonds[i].break();
      this.bonds.splice(i, 1);
      return;
    }
  }
};

MolecularSimulation.prototype.draw = function() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  for (var i = 0; i < this.bonds.length; i++) {
    this.bonds[i].draw();
  }
  
  for (var i = 0; i < this.molecules.length; i++) {
    if (!this.molecules[i].isBonded()) {
      this.molecules[i].draw();
    }
  }
};

// Initialize and run with requestAnimationFrame for better performance
var simulation;
var lastTime = 0;

function init() {
  var count = window.innerWidth > 500 ? 150 : 40;
  var radius = window.innerWidth > 500 ? 3 : 2;
  simulation = new MolecularSimulation(count, radius);
  lastTime = performance.now();
  requestAnimationFrame(animate);
}

function animate(currentTime) {
  var dt = Math.min((currentTime - lastTime) / 1000, 0.05);
  lastTime = currentTime;
  
  simulation.applyDeviceMotion(dt);
  simulation.update(dt);
  simulation.draw();
  requestAnimationFrame(animate);
}

init();

window.addEventListener('resize', function() {
  CANVAS_WIDTH = window.innerWidth;
  CANVAS_HEIGHT = window.innerWidth > 500 
    ? window.innerHeight * 0.66 
    : window.innerHeight * 0.40;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
});

// Device Motion Support - responds to shaking, not tilt
var deviceAcceleration = { x: 0, y: 0 };
var MOTION_SENSITIVITY = 8; // Subtle response to shaking
var MOTION_DECAY = 0.9;     // Effect fades quickly

function handleDeviceMotion(event) {
  // Use acceleration WITHOUT gravity - only responds to shaking/movement
  var accel = event.acceleration;
  if (accel && accel.x !== null) {
    deviceAcceleration.x = accel.x * MOTION_SENSITIVITY;
    deviceAcceleration.y = accel.y * MOTION_SENSITIVITY;
  }
}

// Apply device motion to molecules in simulation
MolecularSimulation.prototype.applyDeviceMotion = function(dt) {
  // Only apply if there's significant motion
  if (Math.abs(deviceAcceleration.x) < 0.5 && Math.abs(deviceAcceleration.y) < 0.5) {
    return;
  }
  
  for (var i = 0; i < this.molecules.length; i++) {
    var mol = this.molecules[i];
    if (!mol.isBonded()) {
      mol.vx += deviceAcceleration.x * dt;
      mol.vy += deviceAcceleration.y * dt;
    }
  }
  for (var i = 0; i < this.bonds.length; i++) {
    this.bonds[i].vx += deviceAcceleration.x * dt;
    this.bonds[i].vy += deviceAcceleration.y * dt;
  }
  
  // Decay the effect so it doesn't accumulate
  deviceAcceleration.x *= MOTION_DECAY;
  deviceAcceleration.y *= MOTION_DECAY;
};

// Request permission for iOS 13+ (requires user gesture)
function requestMotionPermission() {
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(function(response) {
        if (response === 'granted') {
          window.addEventListener('devicemotion', handleDeviceMotion);
        }
      })
      .catch(console.error);
  } else if ('DeviceMotionEvent' in window) {
    // Non-iOS devices
    window.addEventListener('devicemotion', handleDeviceMotion);
  }
}

// Try to enable motion on first touch (required for iOS permission)
document.addEventListener('touchstart', function enableMotion() {
  requestMotionPermission();
  document.removeEventListener('touchstart', enableMotion);
}, { once: true });

// Also try immediately for non-iOS
if ('DeviceMotionEvent' in window && typeof DeviceMotionEvent.requestPermission !== 'function') {
  window.addEventListener('devicemotion', handleDeviceMotion);
}
