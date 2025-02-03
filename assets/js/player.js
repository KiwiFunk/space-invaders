import Bullet from './bullet.js';

class Invader {
    constructor(baseClass, hp, xpos, ypos) {
        this.baseClass = baseClass;
        this.hp = hp;
        this.xpos = xpos;
        this.ypos = ypos;
    }

    spawn() {
        const gameArea = document.getElementById('gameArea');
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
        const bullet = new Bullet(this.xpos + this.element.offsetWidth / 2, this.ypos + this.element.offsetHeight, 1, 5);
        bullet.spawn();
        return bullet;
    }
}

export default Invader;