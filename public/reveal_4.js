let startOpacityEffect = (inputImage, elementId) => {
    return new p5(function(p) {

        let particles = [];
        let img;
        const spacing = 7.5;

        p.preload = function() {
            img = inputImage; // Already loaded p5.Image passed in
        }

        p.setup = function() {
            let container = document.getElementById(elementId);
            let canvasWidth = container.offsetWidth;
            let canvasHeight = container.offsetHeight;

            p.createCanvas(canvasWidth, canvasHeight).parent(container);
            img.resize(2*canvasWidth, 2*canvasHeight);
            img.loadPixels();

            spawnParticles(canvasWidth, canvasHeight);
        }

        p.draw = function() {
            p.background("white");
            for (let particle of particles) {
                particle.draw();
            }
        }

        p.mouseMoved = function() {
            for (let particle of particles) {
                if (particle.checkHover(p.mouseX, p.mouseY)) {
                    particle.update();
                }
            }
        }

        function spawnParticles(w, h) {
            for (let i = 0; i < w; i += spacing) {
                for (let j = 0; j < h; j += spacing) {
                    let pixel = img.get(i, j);
                    let c = p.color(pixel[0], pixel[1], pixel[2], 50); // initially transparent
                    particles.push(new Particle(i, j, c));
                }
            }
        }

        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.col = color;
                this.size = spacing;
                this.isHovered = false;
            }

            update() {
                this.col.setAlpha(255); // Reveal on hover
            }

            checkHover(mx, my) {
                let d = p.dist(mx, my, this.x, this.y);
                this.isHovered = d < this.size * 2;
                return this.isHovered;
            }

            draw() {
                p.fill(this.col);
                p.noStroke();
                p.ellipse(this.x, this.y, this.size);
            }
        }

    }, elementId);
}
