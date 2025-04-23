let startPixelEffect = (inputImage, elementId) => {
    return new p5(function(p) {

        let col = 50;
        let row = 50;
        let stripWidth, rowHeight;
        let grid = [];
        let originalGrid = [];
        let shuffledGrid = [];
        let img;
        let canvasWidth, canvasHeight;
        let step = 0;

        p.preload = function() {
            img = inputImage; // should already be a p5.Image
        }

        p.setup = function() {
            let container = document.getElementById(elementId);
            canvasWidth = container.offsetWidth;
            canvasHeight = container.offsetHeight;

            stripWidth = canvasWidth / col;
            rowHeight = canvasHeight / row;

            p.createCanvas(canvasWidth, canvasHeight).parent(container);
            img.resize(canvasWidth, canvasHeight);
            img.loadPixels();

            createGrid();
        }

        p.draw = function() {
            for (let i = 0; i < col; i++) {
                for (let j = 0; j < row; j++) {
                    p.image(shuffledGrid[i][j], i * stripWidth, j * rowHeight);
                }
            }
        }

        function createGrid() {
            grid = [];
            for (let i = 0; i < col; i++) {
                grid[i] = [];
                for (let j = 0; j < row; j++) {
                    grid[i][j] = img.get(i * stripWidth, j * rowHeight, stripWidth, rowHeight);
                }
            }

            originalGrid = grid.map(row => row.map(cell => cell.get()));
            shuffledGrid = p.shuffle2DArray(grid);
        }

        p.shuffle2DArray = function(arr) {
            let flatArray = [];
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr[i].length; j++) {
                    flatArray.push(arr[i][j]);
                }
            }

            flatArray = p.shuffle(flatArray);

            let k = 0;
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr[i].length; j++) {
                    arr[i][j] = flatArray[k++];
                }
            }

            return arr;
        }

        p.mousePressed = function () {
            if (step < 9) {
                col = Math.max(5, col - 5);
                row = Math.max(5, row - 5);
                stripWidth = canvasWidth / col;
                rowHeight = canvasHeight / row;
                createGrid();
                step++;
            } else {
                // Final click: restore original image
                p.image(inputImage, 0, 0, canvasWidth, canvasHeight);
                step = 0; // reset for next round
            }
        }

    }, elementId);
};
