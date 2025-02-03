class Player {
    constructor(lives, xpos, ypos) {
        this.lives = lives;
        this.xpos = xpos;
        this.ypos = ypos;
    }

    spawn() {
        //Spawn player on screen
    }

    resetPlayer() {
        //Reset player position and lives
    }   

    shoot() {
        // Fire bullet
    }

    move(dx, dy) {
        //Move Player
    }

    getHit() {
        //Reduce player lives
    }

}

export default Player;