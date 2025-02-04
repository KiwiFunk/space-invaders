import Bullet from './bullet.js';

class Invader {
    constructor(baseClass, hp, xpos, ypos, scoreValue, canShoot) {
        this.baseClass = baseClass;
        this.hp = hp;
        this.xpos = xpos;
        this.ypos = ypos;
        this.scoreValue = scoreValue;
        this.canShoot = canShoot;
    }

    spawn() {
        const gameArea = document.getElementById('gameArea');
        this.canShoot = false;
        this.element = document.createElement('div');
        this.element.className = this.baseClass;
        this.element.style.position = 'absolute';
        this.element.style.left = this.xpos + 'px';
        this.element.style.top = this.ypos + 'px';
        gameArea.appendChild(this.element);
        this.startAnimation();
    }

    startAnimation() {
        this.animationInterval = setInterval(() => {
            this.currentFrame = this.currentFrame === 'a' ? 'b' : 'a';
            this.element.style.backgroundImage = `url('assets/images/${this.baseClass}_${this.currentFrame}.webp')`;
        }, 500);
    }

    move(dx, dy) {
        this.xpos += dx;
        this.ypos += dy;
        this.element.style.left = this.xpos + 'px';
        this.element.style.top = this.ypos + 'px';
    }

    shoot() {
        if (this.canShoot) {
            const bullet = new Bullet(this.xpos + this.element.offsetWidth / 2, this.ypos + this.element.offsetHeight, 1, 5);
            bullet.spawn();
            return bullet;
        }
    }

    getHit() {
        // Returns bool
        this.hp -= 100;
        if (this.hp === 0) {
            return true; 
        }
        return false;
    }

    despawn() {
        clearInterval(this.animationInterval);
        this.element.remove();
    }
}

export default Invader;
