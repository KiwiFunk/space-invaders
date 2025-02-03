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
        gameArea.appendChild(this.element);
    }

    resetPlayer() {
        //Reset player position and lives
    }   

    shoot() {
        // Fire bullet
    }

    move(dx, dy) {
        this.xpos += dx;
        this.ypos += dy;
        this.element.style.left = this.xpos + 'px';
        this.element.style.top = this.ypos + 'px';
    }

    getHit() {
        //Reduce player lives
    }

}

export default Player;