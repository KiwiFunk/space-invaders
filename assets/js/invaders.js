import Bullet from './bullet.js';

class Invader {
    constructor(baseClass, hp, xpos, ypos, canShoot) {
        this.baseClass = baseClass;
        this.hp = hp;
        this.xpos = xpos;
        this.ypos = ypos;
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
    }

    move(dx, dy) {
        this.xpos += dx;
        this.ypos += dy;
        this.element.style.left = this.xpos + 'px';
        this.element.style.top = this.ypos + 'px';
    }

    getHit() {
        this.hp -= 100;
        if (this.hp === 0) {
            this.element.remove();
        }
    }

    shoot() {
        if (this.canShoot) {
            const bullet = new Bullet(this.xpos + this.element.offsetWidth / 2, this.ypos + this.element.offsetHeight, 1, 5);
            bullet.spawn();
            return bullet;
        }
    }
}

export default Invader;
