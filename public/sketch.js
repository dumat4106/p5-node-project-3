var socket;
var completedImage;
var userNumber;
var playerNumber;

//for the user functionality 
let userStrokes = {}; 
let currentViewIndex = 0;
let userIds = [];

let currentColor;
let mouseColor;
let tempCanvas;
let gradientImage;
let hoveredColor;

let pickerX = 25;
let pickerY = 25;
let dragging = false;
let pickerRadius = 15;

function preload() {
  gradientImage = loadImage('Images/Color_gradient.png');
}

function setup() {
  createCanvas(500, 500).parent("drawing-canvas");
  background(251);

  tempCanvas = createGraphics(350, 350);
  tempCanvas.background(51);
  if (gradientImage) {
    tempCanvas.image(gradientImage, 0, 0);

    console.log("image loaded!");
  } else {
    console.log("gradientImage not loaded!");
  }

  socket = io.connect('http://localhost:3000');
  socket.on('mouse', newDrawing);

  socket.on('connect', () => {
    console.log("Connected to server with ID:", socket.id); // ✅ Should appear
  });
  
  //assigns player number 
  socket.on('usernames', (playerNumber) => {
    userNumber = playerNumber;
    const usernameElement = document.getElementById("username");
    
    if (usernameElement) {
      usernameElement.innerText = "You are " + userNumber;
      console.log("Username set to:", userNumber);
    } else {
      console.error("Username element not found");
    }
  });
}

function newDrawing(data) {

  if (!userStrokes[data.user]) {
    userStrokes[data.user] = [];
  }
  userStrokes[data.user].push({ x: data.x, y: data.y });

  noStroke();
  fill(55);
  ellipse(data.x, data.y, 36, 36);
}

function mouseDragged() {
  
  var data = {
    x: mouseX,
    y: mouseY,
    user: userNumber
  }
  socket.emit('mouse', data);

  noStroke();
  fill(55);
  ellipse(mouseX, mouseY, 36, 36);

  // also save locally
  if (!userStrokes[userNumber]) {
    userStrokes[userNumber] = [];
  }
  userStrokes[userNumber].push({ x: mouseX, y: mouseY });
}

/*
function mouseMoved() {
  
  mouseColor = tempCanvas.get(mouseX, mouseY);
  tempCanvas.clear();
  tempCanvas.image(gradientImage, 0, 0);
  tempCanvas.stroke(255);
  tempCanvas.strokeWeight(2.5);
  tempCanvas.fill(mouseColor);
  tempCanvas.ellipse(mouseX + 30, mouseY + 30, 30, 30);

  if (hoveredColor) {
    hoveredColor.style.backgroundColor = colorToCSS(mouseColor);
  }
}
  */

function colorToCSS(c) {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function draw() {
  tempCanvas.clear();
  tempCanvas.image(gradientImage, 0, 0); // draw your gradient

  if (dragging) {
    pickerX = constrain(mouseX, 0, tempCanvas.width);
    pickerY = constrain(mouseY, 0, tempCanvas.height);
  }

  tempCanvas.fill(255, 0, 0, 0);
  tempCanvas.stroke(0);
  tempCanvas.strokeWeight(2);
  tempCanvas.ellipse(pickerX, pickerY, pickerRadius * 2);

  let c = tempCanvas.get(pickerX, pickerY);

  if (hoveredColor) {
    hoveredColor.style.backgroundColor = colorToCSS(c);
  }

}

function mousePressed(){
  if (dist(mouseX, mouseY, pickerX, pickerY) < pickerRadius) {
    dragging = true;
  }
}

function mouseReleased() {
  dragging = false;
}


function getImage() {

  completedImage = get();

  let overlay = document.createElement("div");
  overlay.setAttribute("id", "overlay");
  document.body.appendChild(overlay);
  
  //adds div to show image
  let effectContainer = document.createElement("div");
  effectContainer.setAttribute("id", "effect-output");
  overlay.appendChild(effectContainer);

  //canvas is now in effectContainer 
  let canvasElt = document.querySelector("canvas");
  if (canvasElt) {
    effectContainer.appendChild(canvasElt);
  }

  let nextButton = document.createElement("button");
  nextButton.setAttribute("id", "next-Button");
  nextButton.addEventListener("click", nextUser);
  overlay.appendChild(nextButton)

  startParticleEffect(completedImage, "effect-output");

  userIds = Object.keys(userStrokes);
  currentViewIndex = 0;
  showUserDrawing(currentViewIndex);
}



function showUserDrawing(index) {
  clear();
  background(51);
  
  const userId = userIds[index];
  const strokes = userStrokes[userId];

  if (strokes) {
    for (let s of strokes) {
      ellipse(s.x, s.y, 36, 36);
    }
  }

  const usernameElement = document.getElementById("username");
  if (usernameElement) {
    usernameElement.innerText = "Viewing: " + userId;
  }
}

function nextUser() {
  console.log("Next button clicked"); // DEBUG

  //if (userIds.length === 0) return;

  currentViewIndex = (currentViewIndex + 1) % userIds.length;
  console.log(currentViewIndex);
  showUserDrawing(currentViewIndex);
}

//COLOR FUNCTION

//when user clicks on color wheel
function showColorOverlay() {

  let colorOverlay = document.createElement("div");
  colorOverlay.setAttribute("id", "color-overlay");
  document.getElementById("drawing-canvas").appendChild(colorOverlay);

  let tempCanvasElt = tempCanvas.elt;
  tempCanvasElt.setAttribute("id", "temp-canvas");
  tempCanvasElt.style.display = "block";
  colorOverlay.appendChild(tempCanvasElt);

  hoveredColor = document.createElement("div");
  hoveredColor.setAttribute("id", "hovered-color");
  colorOverlay.appendChild(hoveredColor);

  let brightnessToggle = document.createElement("div");
  brightnessToggle.setAttribute("id", "brightness-toggle");
  colorOverlay.appendChild(brightnessToggle);


}