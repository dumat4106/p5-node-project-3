let startWavyEffect = (inputImage, elementId) => {
    return new p5(function(p) {

        let particles = [];
        let img;
        const spacing = 7.5;

        p.preload = function() {
            img = inputImage; // Already a p5.Image object
        }

        p.setup = function() {
            let container = document.getElementById(elementId);
            let canvasWidth = container.offsetWidth;
            let canvasHeight = container.offsetHeight;

            p.createCanvas(canvasWidth, canvasHeight).parent(container);
            img.resize(2*canvasWidth, 2*canvasHeight);
            img.loadPixels();
            spawnParticles(canvasWidth, canvasHeight);
            p.background("white");
        }

        p.draw = function() {
            p.background("white");
            for (let particle of particles) {
                particle.update();
                particle.draw();
            }
        }

        p.mouseMoved = function() {
            for (let particle of particles) {
                if (particle.isHovered(p.mouseX, p.mouseY)) {
                    particle.scatter();
                }
            }
        }

        function spawnParticles(width, height) {
            for (let i = 0; i < width; i += spacing) {
                for (let j = 0; j < height; j += spacing) {
                    const col = img.get(i, j);
                    particles.push(new Particle(i, j, col));
                }
            }
        }

        class Particle {
            constructor(x, y, col) {
                this.origin = p.createVector(x, y);
                this.pos = this.origin.copy();
                this.vel = p.createVector(0, 0);
                this.col = col;
                this.size = spacing;
                this.isScattering = false;
                this.scatterTimer = 0;
                this.scatterDuration = 30;
            }

            scatter() {
                if (!this.isScattering) {
                    let angle = p.random(p.TWO_PI);
                    let speed = p.random(3, 6);
                    this.vel = p.createVector(p.cos(angle), p.sin(angle)).mult(speed);
                    this.isScattering = true;
                    this.scatterTimer = 0;
                }
            }

            update() {
                if (this.isScattering) {
                    this.pos.add(this.vel);
                    this.vel.mult(0.95);
                    this.scatterTimer++;
                    if (this.scatterTimer > this.scatterDuration) {
                        this.isScattering = false;
                    }
                } else {
                    let dir = p5.Vector.sub(this.origin, this.pos);
                    this.vel.add(dir.mult(0.05));
                    this.vel.mult(0.9);
                    this.pos.add(this.vel);

                    if (dir.mag() < 0.5 && this.vel.mag() < 0.5) {
                        this.pos = this.origin.copy();
                        this.vel.mult(0);
                    }
                }
            }

            isHovered(mx, my) {
                let d = p.dist(mx, my, this.pos.x, this.pos.y);
                return d < 15;
            }

            draw() {
                p.fill(this.col);
                p.noStroke();
                p.ellipse(this.pos.x, this.pos.y, this.size);
            }
        }

    }, elementId);
}
