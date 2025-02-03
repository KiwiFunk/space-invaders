class Bullet {
    constructor(xpos, ypos, direction, speed) {
        this.xpos = xpos;
        this.ypos = ypos;
        this.direction = direction; // 1 for player, -1 for invader
        this.speed = speed;
    }

    spawn() {
        const gameArea = document.getElementById('gameArea');
        this.element = document.createElement('div');
        this.element.className = 'bullet';
        this.element.style.position = 'absolute';
        this.element.style.left = this.xpos + 'px';
        this.element.style.top = this.ypos + 'px';
        gameArea.appendChild(this.element);
    }

    move() {
        this.ypos += this.speed * this.direction;
        this.element.style.top = this.ypos + 'px';
        
        // Return false if bullet is out of bounds
        return this.ypos > 0 && this.ypos < window.innerHeight;
    }

    remove() {
        this.element.remove();
    }
}

export default Bullet;
