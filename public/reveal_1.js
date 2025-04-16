let startParticleEffect = (inputImage, elementId) => {
    return new p5((p) => {
      let particles = [];
      let img;
      let particlesToAdd = [];
      let particlesToRemove = [];
  
      p.preload = () => {
        img = inputImage;
      };
  
      p.setup = () => {
        const container = document.getElementById(elementId);
        const w = container.offsetWidth;
        const h = container.offsetHeight;
      
        p.createCanvas(w, h).parent(container);
        p.pixelDensity(1); // prevents retina mismatch issues
        img.resize(w, h);
        img.loadPixels();
      
        particles.push(new Particle(w / 2, h / 2, img.get(w / 2, h / 2), w));
      };
  
      p.draw = () => {
        p.background("white");

        
        image(img, 0, 0, w, h);

        particlesToAdd = [];
        particlesToRemove = [];
  
        for (let particle of particles) {
          particle.draw();
          if (particle.isHovered() && !particle.hasSplit) {
            particle.update();
          }
        }
  
        particles = particles.concat(particlesToAdd);
        particles = particles.filter(p => !particlesToRemove.includes(p));
      };
  
      class Particle {
        constructor(x, y, color, size) {
          this.x = x;
          this.y = y;
          this.col = color;
          this.size = size;
          this.hasSplit = false;
        }
  
        update() {
          if (!this.hasSplit) {
            const offset = this.size / 4;
            const newSize = this.size / 2;
  
            particlesToAdd.push(
              new Particle(this.x - offset, this.y - offset, img.get(this.x - offset, this.y - offset), newSize),
              new Particle(this.x + offset, this.y - offset, img.get(this.x + offset, this.y - offset), newSize),
              new Particle(this.x + offset, this.y + offset, img.get(this.x + offset, this.y + offset), newSize),
              new Particle(this.x - offset, this.y + offset, img.get(this.x - offset, this.y + offset), newSize)
            );
  
            this.hasSplit = true;
            particlesToRemove.push(this);
          }
        }
  
        isHovered() {
          let d = p.dist(p.mouseX, p.mouseY, this.x, this.y);
          return d < this.size / 2;
        }
  
        draw() {
          p.fill(this.col);
          p.noStroke();
          p.ellipse(this.x, this.y, this.size);
        }
      }
    }, elementId); // ← attach canvas to given container
  };
  