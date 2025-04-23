let startPuzzleEffect = (inputImage, elementId) => {
    return new p5(function(p) {
        let img;
        let pieces = [];
        let pieceSize = 100;
        let selectedPiece = null;
        let offsetX, offsetY;

        p.preload = function() {
            img = inputImage; // Image is passed in as p5.Image
        }

        p.setup = function() {
            let container = document.getElementById(elementId);
            let canvasWidth = container.offsetWidth;
            let canvasHeight = container.offsetHeight;
            p.createCanvas(canvasWidth, canvasHeight).parent(container);

            img.resize(canvasWidth, canvasHeight);
            createPuzzle();
        }

        p.draw = function() {
            p.background(220);

            for (let piece of pieces) {
                piece.display();
            }

            if (selectedPiece) {
                p.noFill();
                p.stroke(255, 0, 0);
                p.strokeWeight(2);
                p.rect(selectedPiece.x, selectedPiece.y, pieceSize, pieceSize);
            }
        }

        function createPuzzle() {
            pieces = [];
            let cols = p.floor(img.width / pieceSize);
            let rows = p.floor(img.height / pieceSize);

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    let pieceImg = p.createImage(pieceSize, pieceSize);
                    pieceImg.copy(img, x * pieceSize, y * pieceSize, pieceSize, pieceSize, 0, 0, pieceSize, pieceSize);

                    let piece = {
                        img: pieceImg,
                        correctX: x * pieceSize,
                        correctY: y * pieceSize,
                        x: p.random(p.width - pieceSize),
                        y: p.random(p.height - pieceSize),
                        width: pieceSize,
                        height: pieceSize,
                        isCorrect: false,
                        display: function () {
                            p.image(this.img, this.x, this.y);
                            if (this.isCorrect) {
                                p.noFill();
                                p.stroke(0, 255, 0);
                                p.strokeWeight(3);
                                p.rect(this.x, this.y, this.width, this.height);
                            }
                        }
                    };

                    pieces.push(piece);
                }
            }

            pieces = p.shuffle(pieces);
        }

        p.mousePressed = function() {
            for (let i = pieces.length - 1; i >= 0; i--) {
                let piece = pieces[i];
                if (!piece.isCorrect &&
                    p.mouseX > piece.x && p.mouseX < piece.x + piece.width &&
                    p.mouseY > piece.y && p.mouseY < piece.y + piece.height) {
                    selectedPiece = piece;
                    offsetX = p.mouseX - piece.x;
                    offsetY = p.mouseY - piece.y;

                    // Bring selected to front
                    pieces.splice(i, 1);
                    pieces.push(piece);
                    break;
                }
            }
        }

        p.mouseDragged = function() {
            if (selectedPiece) {
                selectedPiece.x = p.mouseX - offsetX;
                selectedPiece.y = p.mouseY - offsetY;
            }
        }

        p.mouseReleased = function() {
            if (selectedPiece) {
                let d = p.dist(selectedPiece.x, selectedPiece.y,
                               selectedPiece.correctX, selectedPiece.correctY);
                if (d < 20) {
                    selectedPiece.x = selectedPiece.correctX;
                    selectedPiece.y = selectedPiece.correctY;
                    selectedPiece.isCorrect = true;
                }
                selectedPiece = null;
            }
        }

    }, elementId);
};
