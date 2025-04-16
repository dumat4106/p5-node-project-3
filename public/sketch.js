var socket;
var completedImage;


function setup() {
  createCanvas(500, 500).parent("drawing-canvas");
  background(51);

  socket = io.connect('http://localhost:3000');
  socket.on('mouse', newDrawing);
}

function newDrawing(data) {
  noStroke();
  fill(255);
  ellipse(data.x, data.y, 36, 36);
}

function mouseDragged() {
  
  var data = {
    x: mouseX,
    y: mouseY
  }
  socket.emit('mouse', data);

  noStroke();
  fill(255);
  ellipse(mouseX, mouseY, 36, 36);
}

function draw() {
}

function getImage() {

  completedImage = get();

  //document.body.removeChild(document.getElementById("total-canvas"));  // Safely remove if it exists
  
  //adds div to show image
  let effectContainer = document.createElement("div");
  effectContainer.setAttribute("id", "effect-output");
  document.body.appendChild(effectContainer);

  startParticleEffect(completedImage, "effect-output");
}