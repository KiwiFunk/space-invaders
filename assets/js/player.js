import Bullet from './bullet.js';

class Player {
    constructor(lives, xpos, ypos) {
        this.lives = lives;
        this.xpos = xpos;
        this.ypos = ypos;
    }

    spawn() {
        const gameArea = document.getElementById('gameArea');
        this.element = document.createElement('div');
        this.element.className = 'player';
        this.element.style.position = 'absolute';
        this.element.style.left = this.xpos + 'px';
        this.element.style.top = this.ypos + 'px';
        this.lives = this.lives;
        gameArea.appendChild(this.element);
    }

    resetPlayer() {
        //Reset player position and lives
    }   

    shoot() {
        const bullet = new Bullet(this.xpos + this.element.offsetWidth / 2, this.ypos, -1, 5);
        bullet.spawn();
        return bullet;
    }

    move(dx, dy) {
        this.xpos += dx;
        this.ypos += dy;
        this.element.style.left = this.xpos + 'px';
        this.element.style.top = this.ypos + 'px';
    }

    getHit() {
        this.lives -= 1;
        if (this.lives === 0) {
            this.despawn();
            return true;
        }
        return false;
    }

    despawn() {
        this.element.remove();
    }
}

export default Player;