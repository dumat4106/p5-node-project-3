var socket;
var completedImage;
var userNumber;
var playerNumber;

//for the user functionality 
let userStrokes = {}; 
let currentViewIndex = 0;
let userIds = [];

let currentColor;

function setup() {
  createCanvas(500, 500).parent("drawing-canvas");
  background(251);

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

function draw() {
  //display username

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

//when user clicks on color wheel
function showColorOverlay() {

  let colorOverlay = document.createElement("div");
  colorOverlay.setAttribute("id", "color-overlay");
  document.body.appendChild(colorOverlay);

  let colorGradient = document.createElement("div");
  colorGradient.setAttribute("id", "color-gradient");
  colorOverlay.appendChild(colorGradient);

  let hoveredColor = document.createElement("div");
  hoveredColor.setAttribute("id", "hovered-color");
  colorOverlay.appendChild(hoveredColor);

  let brightnessToggle = document.createElement("div");
  brightnessToggle.setAttribute("id", "brightness-toggle");
  colorOverlay.appendChild(brightnessToggle);

}