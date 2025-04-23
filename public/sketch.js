var socket;
var completedImage;
var userNumber;
var playerNumber;
let userId;
let isColorOverlayOpen = false;
let isBrushSizeOpen = false;

//for the user functionality 
let userStrokes = {}; 
let currentStroke = []; // holds the current stroke while dragging
let currentViewIndex = 0;
let userIds = [];

let p;
let currentColor;
let colorOverlay;
let overlay;
let mouseColor;
let tempCanvas;
let gradientImage;
let hoveredColor;
let brightnessValue = 1;
let adjustedColor;

let pickerX = 25;
let pickerY = 25;
let dragging = false;
let pickerRadius = 15;

let isErasing = false;
let eraserBtn;

let lastMouseX, lastMouseY;
let lastTime = 0;

let brushSize = 36;
let brushOverlay;
let brushOne, brushTwo, brushThree, brushFour;

let playerView;

let showAllColors = false;

let canvasElt;

let opacityOverlay;

let circleEffect = true;
let pixelEffect = false;
let wavyEffect = false;
let opacityEffect = false; 
let puzzleEffect = false; 

let demoImage;


function preload() {
  gradientImage = loadImage('Images/Color_gradient.png');
  //demoImage = loadImage("Images/demo-flowers.png");
}

function setup() {
  createCanvas(500, 500).parent("drawing-canvas");
  
  background(251);

  //disableTouchScrollOnCanvas();

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

  socket.on("erase", (data) => {
    const { x, y, user, radius } = data;
  
    if (userStrokes[user]) {
      userStrokes[user] = userStrokes[user].filter(stroke => {
        return dist(x, y, stroke.x, stroke.y) > radius;
      });
  
      redrawAllStrokes();
    }
  });
}

function newDrawing(data) {
  if (!userStrokes[data.user]) {
    userStrokes[data.user] = [];
  }
  userStrokes[data.user].push({
    x: data.x,
    y: data.y,
    pressure: data.pressure,
    color: data.color, // Store the color
  });

  noStroke();

  //comment out for normal drawing
   // Show current user's drawings in color, others in grey
   if (data.user === userNumber) {
    fill(data.color, 255 * data.pressure);
  } else {
    fill(150, 150, 150, 255 * data.pressure); // Grey color
  }

  //uncomment for normal drawing
  //fill(data.color, 255 * data.pressure); 
  ellipse(data.x, data.y, brushSize * data.pressure + 10, brushSize * data.pressure + 10);
}


function mouseDragged() {
  if (isColorOverlayOpen) return;
  const eraseRadius = 20;

  let now = millis();
  let dt = now - lastTime;
  let dx = mouseX - lastMouseX;
  let dy = mouseY - lastMouseY;
  let speed = dist(mouseX, mouseY, lastMouseX, lastMouseY) / (dt || 1);

  let pressure = map(speed, 0, 5, 1, 0);
  pressure = constrain(pressure, 0.1, 1);

  let colorData = adjustedColor.levels;

  if (isErasing) {
    userStrokes[userNumber] = userStrokes[userNumber].filter(stroke => {
      return dist(mouseX, mouseY, stroke.x, stroke.y) > eraseRadius;
    });

    socket.emit("erase", {
      x: mouseX,
      y: mouseY,
      user: userNumber,
      radius: eraseRadius
    });

    redrawAllStrokes();
  } else {
    let numSteps = int(dist(mouseX, mouseY, lastMouseX, lastMouseY) / 2);
    for (let i = 0; i <= numSteps; i++) {
      let t = i / numSteps;
      let x = lerp(lastMouseX, mouseX, t);
      let y = lerp(lastMouseY, mouseY, t);
      p = pressure;

      noStroke();
      fill(adjustedColor, 255 * p);
      ellipse(x, y, brushSize * p + 10, brushSize * p + 10);

      // Save the stroke
      let strokeData = {
        x: x,
        y: y,
        user: userNumber,
        pressure: p,
        color: adjustedColor.levels, // Store color as RGB levels
      };

      socket.emit('mouse', strokeData);

      if (!userStrokes[userNumber]) {
        userStrokes[userNumber] = [];
      }
      if (!currentStroke) currentStroke = [];

      currentStroke.push({ x, y, pressure, color: adjustedColor.levels });
      userStrokes[userNumber].push(strokeData);
    }
  }

  lastMouseX = mouseX;
  lastMouseY = mouseY;
  lastTime = now;
}

function colorToCSS(c) {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function draw() {
  //image(demoImage, 0, 0, 500, 500);

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

  let c = tempCanvas.get(pickerX, pickerY); // Original color
  let baseColor = color(c);
  updateBrightnessSliderGradient(baseColor); 
  
  // Get RGB values
  let r = red(baseColor);
  let g = green(baseColor);
  let b = blue(baseColor);
  
  // Linearly interpolate toward white (255, 255, 255)
  let bright = brightnessValue; // 0 to 2
  if (bright > 1) {
    let t = map(bright, 1, 2, 0, 1); // how close we are to full white
    r = lerp(r, 255, t);
    g = lerp(g, 255, t);
    b = lerp(b, 255, t);
  } else {
    r *= bright;
    g *= bright;
    b *= bright;
  }
  
  adjustedColor = color(r, g, b);
  

  if (hoveredColor) {
    hoveredColor.style.backgroundColor = colorToCSS([r, g, b]);
  }

  const currentColor = document.getElementById("current-color");

  if (currentColor) {
    currentColor.style.backgroundColor = colorToCSS([r, g, b]);
  }

}

function mousePressed(){
  if (isColorOverlayOpen) {
    if (dist(mouseX, mouseY, pickerX, pickerY) < pickerRadius) {
      dragging = true;
    }
  } else {
    currentStroke = [];

    const now = millis();
    const pressure = 1; // Max pressure on tap
    const x = mouseX;
    const y = mouseY;
  
    // Draw the dot
    noStroke();
    fill(adjustedColor, 255 * pressure);
    ellipse(x, y, brushSize * pressure + 10, brushSize * pressure + 10);
  
    // Save the stroke
    let strokeData = {
      x: x,
      y: y,
      user: userNumber,
      pressure: pressure,
      color: adjustedColor.levels, // Store color as RGB levels
    };
  
    socket.emit('mouse', strokeData);
  
    if (!userStrokes[userNumber]) {
      userStrokes[userNumber] = [];
    }
    if (!currentStroke) currentStroke = [];
  
    currentStroke.push({ x, y, pressure, color: adjustedColor.levels });
    //userStrokes[userNumber].push(strokeData);
  
    // Update last mouse for next drag
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    lastTime = now;
  }
}

function mouseReleased() {
  dragging = false;

  if (currentStroke.length > 0) {
    if (!userStrokes[userNumber]) {
      userStrokes[userNumber] = [];
    }
    userStrokes[userNumber].push([...currentStroke]);
    currentStroke = [];
  }
}

function undoLastStroke() {
  if (userStrokes[userNumber] && userStrokes[userNumber].length > 0) {
    userStrokes[userNumber].pop(); // Remove last stroke
    redrawAllStrokes(); // Re-render everything
  }
}

function getImage() {

  // Create a temporary flag to show all colors
  let previousShowAllColors = showAllColors; // Save current state
  showAllColors = true; // Force show all colors
  
  // Redraw everything with original colors
  redrawAllStrokes();
  
  // Capture the image with all colors
  completedImage = get();
  
  // Restore the previous state
  showAllColors = previousShowAllColors;

  opacityOverlay = document.createElement("div");
  opacityOverlay.setAttribute("id", "opacity-overlay");
  document.body.appendChild(opacityOverlay);

  overlay = document.createElement("div");
  overlay.setAttribute("id", "overlay");
  document.body.appendChild(overlay);
  
  //adds div to show image
  let effectContainer = document.createElement("div");
  effectContainer.setAttribute("id", "effect-output");
  overlay.appendChild(effectContainer);

  //canvas is now in effectContainer 
  canvasElt = document.querySelector("canvas");
  if (canvasElt) {
    effectContainer.appendChild(canvasElt);
  }

  let nextButton = document.createElement("button");
  nextButton.setAttribute("id", "next-Button");
  nextButton.addEventListener("click", nextUser);
  nextButton.textContent = ">";
  overlay.appendChild(nextButton)

  let closeButton = document.createElement("button");
  closeButton.setAttribute("id", "close-button-overlay");
  closeButton.addEventListener("click", closeOverlay);
  closeButton.textContent = "X";
  overlay.appendChild(closeButton);

  let combined = document.createElement("p");
  combined.setAttribute("id", "combined");
  combined.textContent ="Reveal!";
  overlay.appendChild(combined);

  playerView = document.createElement("p");
  playerView.setAttribute("id", "player-view");
  overlay.appendChild(playerView);

  if (circleEffect) {
    startParticleEffect(completedImage, "effect-output");
  } else if (pixelEffect) {
    startPixelEffect(completedImage, "effect-output");
  } else if (wavyEffect) {
    startWavyEffect(completedImage, "effect-output");
  } else if (opacityEffect) {
    startOpacityEffect(completedImage, "effect-output");
  } else {
    startPuzzleEffect(completedImage, "effect-output");
  }

  userIds = Object.keys(userStrokes);
  currentViewIndex = 0;
  showUserDrawing(currentViewIndex);
}

function showUserDrawing(index) {
  clear();
  background(251);
  
  userId = userIds[index];
  const strokes = userStrokes[userId];

  if (strokes) {
    // Handle both cases (array of strokes or array of arrays)
    for (let stroke of strokes) {
      // Check if this is a stroke object or an array of strokes
      if (Array.isArray(stroke)) {
        // Nested array case
        for (let s of stroke) {
          drawSingleStroke(s);
        }
      } else {
        // Direct stroke object case
        drawSingleStroke(stroke);
      }
    }
  }

  playerView.textContent = "Viewing: " + userId;

}

function drawSingleStroke(stroke) {
  let p = stroke.pressure || 1;
  let strokeColor = color(stroke.color[0], stroke.color[1], stroke.color[2]);
  fill(strokeColor, 255 * p);
  noStroke();
  ellipse(stroke.x, stroke.y, brushSize * p + 10, brushSize * p + 10);
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

  isColorOverlayOpen = true;

  colorOverlay = document.createElement("div");
  colorOverlay.setAttribute("id", "color-overlay");
  document.getElementById("drawing-canvas").appendChild(colorOverlay);

  let tempCanvasElt = tempCanvas.elt;
  tempCanvasElt.setAttribute("id", "temp-canvas");
  tempCanvasElt.style.display = "block";
  colorOverlay.appendChild(tempCanvasElt);

  hoveredColor = document.createElement("div");
  hoveredColor.setAttribute("id", "hovered-color");
  colorOverlay.appendChild(hoveredColor);

  let brightnessSlider = document.createElement("input");
  brightnessSlider.setAttribute("type", "range");
  brightnessSlider.setAttribute("min", "0");
  brightnessSlider.setAttribute("max", "2");
  brightnessSlider.setAttribute("step", "0.01");
  brightnessSlider.setAttribute("value", "1"); // Default brightness
  brightnessSlider.setAttribute("id", "brightness-slider");
  colorOverlay.appendChild(brightnessSlider);
  
  brightnessSlider.addEventListener("input", () => {
    brightnessValue = parseFloat(brightnessSlider.value);
  });

  let closeButton = document.createElement("button");
  closeButton.setAttribute("id", "close-button"); 
  closeButton.textContent = "Close";
  closeButton.addEventListener("click", closeColorOverlay);
  colorOverlay.appendChild(closeButton);
}

function updateBrightnessSliderGradient(baseColor) {
  let r = red(baseColor);
  let g = green(baseColor);
  let b = blue(baseColor);

  let css = `linear-gradient(to right, rgb(0, 0, 0), rgb(${r}, ${g}, ${b}), rgb(255, 255, 255))`;

  let slider = document.getElementById("brightness-slider");
  if (slider) {
    slider.style.background = css;
  }
}

function closeColorOverlay() {
  // Save current picker and brightness state
  localStorage.setItem("pickerX", pickerX);
  localStorage.setItem("pickerY", pickerY);
  localStorage.setItem("brightness", brightnessValue);

  if (colorOverlay && colorOverlay.parentNode) {
    colorOverlay.parentNode.removeChild(colorOverlay);
    colorOverlay = null; // Clear the reference
  }

  isColorOverlayOpen = false;
}

function eraseMode() {
  isErasing = !isErasing;

  eraserBtn = document.getElementById("eraser");
  if (isErasing) {
    eraserBtn.style.backgroundColor = "#E3E1FF";
  }
  else {
    eraserBtn.style.backgroundColor = "";
  }
}

function redrawAllStrokes() {
  clear();
  background(251);
  
  for (let user in userStrokes) {
    // Skip if no strokes for this user
    //if (!userStrokes[user] || !Array.isArray(userStrokes[user])) continue;
    
    for (let stroke of userStrokes[user]) {
      // Skip if stroke is invalid
      if (!stroke || typeof stroke !== 'object') continue;
      
      // Default values
      let p = stroke.pressure || 1;
      let x = stroke.x || 0;
      let y = stroke.y || 0;
      noStroke();
      
      // Handle color - three possible cases:
      // 1. Color exists as array [r,g,b]
      // 2. Color exists as p5.js color object
      // 3. Color is missing (use default grey)
      let strokeColor;
      try {
        if (Array.isArray(stroke.color)) {
          strokeColor = color(stroke.color[0], stroke.color[1], stroke.color[2]);
        } else if (stroke.color && stroke.color.levels) {
          strokeColor = color(stroke.color.levels[0], stroke.color.levels[1], stroke.color.levels[2]);
        } else {
          strokeColor = color(150, 150, 150); // Default grey
        }
      } catch (e) {
        console.error("Error processing color:", e);
        strokeColor = color(150, 150, 150); // Fallback to grey
      }
      
      // Apply color based on view mode
      if (showAllColors || user === userNumber) {
        fill(strokeColor);
      } else {
        fill(150, 150, 150); // Grey for other users
      }

      // Draw with opacity based on pressure
      drawingContext.globalAlpha = p;
      ellipse(x, y, brushSize * p + 10, brushSize * p + 10);
      drawingContext.globalAlpha = 1.0; // Reset
    }
  }
}

function disableTouchScrollOnCanvas() {
  const canvasElt = document.querySelector("canvas");

  ['pointerdown', 'pointermove', 'touchstart', 'touchmove'].forEach(evt => {
    canvasElt.addEventListener(evt, (e) => {
      e.preventDefault();
    }, { passive: false });
  });
}

function changeBrushSize() {

  if (!isBrushSizeOpen) {
    brushOverlay = document.createElement("div");
    brushOverlay.setAttribute("id", "brush-overlay");
    document.getElementById("drawing-canvas").appendChild(brushOverlay);
  
    brushOne = document.createElement("button");
    brushOne.setAttribute("id", "brush-one");
    brushOne.textContent = "8px";
    brushOne.addEventListener("click", chooseBrushOne);
    brushOverlay.appendChild(brushOne);
  
    brushTwo = document.createElement("button");
    brushTwo.setAttribute("id", "brush-two");
    brushTwo.textContent = "16px";
    brushTwo.addEventListener("click", chooseBrushTwo);
    brushOverlay.appendChild(brushTwo);
  
    brushThree = document.createElement("button");
    brushThree.setAttribute("id", "brush-three");
    brushThree.textContent = "32px";
    brushThree.addEventListener("click", chooseBrushThree);
    brushOverlay.appendChild(brushThree);
  
    brushFour = document.createElement("button");
    brushFour.setAttribute("id", "brush-four");
    brushFour.textContent = "50px";
    brushFour.addEventListener("click", chooseBrushFour);
    brushOverlay.appendChild(brushFour);

    isBrushSizeOpen = true;
  } else {
    brushOverlay.parentNode.removeChild(brushOverlay);
    isBrushSizeOpen = false;
  }
  
}

function chooseBrushOne() {
    brushOne.style.backgroundColor = "";
    brushTwo.style.backgroundColor = "";
    brushThree.style.backgroundColor = "";
    brushFour.style.backgroundColor = "";

    brushSize = 1;
    
    brushOne.style.backgroundColor = "#E3E1FF";
}

function chooseBrushTwo() {
  brushOne.style.backgroundColor = "";
  brushTwo.style.backgroundColor = "";
  brushThree.style.backgroundColor = "";
  brushFour.style.backgroundColor = "";

  brushSize = 8;
  
  brushTwo.style.backgroundColor = "#E3E1FF";
}

function chooseBrushThree() {
  brushOne.style.backgroundColor = "";
  brushTwo.style.backgroundColor = "";
  brushThree.style.backgroundColor = "";
  brushFour.style.backgroundColor = "";

  brushSize = 16;
  
  brushThree.style.backgroundColor = "#E3E1FF";
}

function chooseBrushFour() {
  brushOne.style.backgroundColor = "";
  brushTwo.style.backgroundColor = "";
  brushThree.style.backgroundColor = "";
  brushFour.style.backgroundColor = "";

  brushSize = 36;
  
  brushFour.style.backgroundColor = "#E3E1FF";
}

function closeOverlay() {
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay);
    overlay = null;
  }

  if (opacityOverlay && opacityOverlay.parentNode) {
    opacityOverlay.parentNode.removeChild(opacityOverlay);
    opacityOverlay = null;
  }

  // Optional: reattach the canvas back to original parent if needed
  const canvasParent = document.getElementById("drawing-canvas");
  if (canvasElt && canvasParent) {
    canvasParent.appendChild(canvasElt);
  }
}

let circleButton;
let pixelButton;
let wavyButton;
let opacityButton;
let puzzleButton;

function chooseCircle () {

  circleEffect = true;
  pixelEffect = false;
  wavyEffect = false;
  opacityEffect = false; 
  puzzleEffect = false; 

  circleButton = document.getElementById("circle-button");
  circleButton.style.backgroundColor = "#595670";

  pixelButton = document.getElementById("pixel-button");
  pixelButton.style.backgroundColor = "";

  wavyButton = document.getElementById("wavy-button");
  wavyButton.style.backgroundColor = "";

  opacityButton = document.getElementById("opacity-button");
  opacityButton.style.backgroundColor = "";

  puzzleButton = document.getElementById("puzzle-button");
  puzzleButton.style.backgroundColor = "";
}

function choosePixel () {

  circleEffect = false;
  pixelEffect = true;
  wavyEffect = false;
  opacityEffect = false; 
  puzzleEffect = false; 

  circleButton = document.getElementById("circle-button");
  circleButton.style.backgroundColor = "";

  pixelButton = document.getElementById("pixel-button");
  pixelButton.style.backgroundColor = "#595670";

  wavyButton = document.getElementById("wavy-button");
  wavyButton.style.backgroundColor = "";

  opacityButton = document.getElementById("opacity-button");
  opacityButton.style.backgroundColor = "";

  puzzleButton = document.getElementById("puzzle-button");
  puzzleButton.style.backgroundColor = "";
}

function chooseWavy () {

  circleEffect = false;
  pixelEffect = false;
  wavyEffect = true;
  opacityEffect = false; 
  puzzleEffect = false; 

  circleButton = document.getElementById("circle-button");
  circleButton.style.backgroundColor = "";

  pixelButton = document.getElementById("pixel-button");
  pixelButton.style.backgroundColor = "";

  wavyButton = document.getElementById("wavy-button");
  wavyButton.style.backgroundColor = "#595670";

  opacityButton = document.getElementById("opacity-button");
  opacityButton.style.backgroundColor = "";

  puzzleButton = document.getElementById("puzzle-button");
  puzzleButton.style.backgroundColor = "";
}

function chooseOpacity () {

  circleEffect = false;
  pixelEffect = false;
  wavyEffect = false;
  opacityEffect = true; 
  puzzleEffect = false; 

  circleButton = document.getElementById("circle-button");
  circleButton.style.backgroundColor = "";

  pixelButton = document.getElementById("pixel-button");
  pixelButton.style.backgroundColor = "";

  wavyButton = document.getElementById("wavy-button");
  wavyButton.style.backgroundColor = "";

  opacityButton = document.getElementById("opacity-button");
  opacityButton.style.backgroundColor = "#595670";

  puzzleButton = document.getElementById("puzzle-button");
  puzzleButton.style.backgroundColor = "";
}

function choosePuzzle () {

  circleEffect = false;
  pixelEffect = false;
  wavyEffect = false;
  opacityEffect = false; 
  puzzleEffect = true; 

  circleButton = document.getElementById("circle-button");
  circleButton.style.backgroundColor = "";

  pixelButton = document.getElementById("pixel-button");
  pixelButton.style.backgroundColor = "";

  wavyButton = document.getElementById("wavy-button");
  wavyButton.style.backgroundColor = "";

  opacityButton = document.getElementById("opacity-button");
  opacityButton.style.backgroundColor = "";

  puzzleButton = document.getElementById("puzzle-button");
  puzzleButton.style.backgroundColor = "#595670";
}

function saveImage() {
  saveCanvas('myArtwork', 'png');
}