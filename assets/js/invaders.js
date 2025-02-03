import Bullet from './bullet.js';

class Invader {
    constructor(baseClass, hp, xpos, ypos) {
        this.baseClass = baseClass;
        this.hp = hp;
        this.xpos = xpos;
        this.ypos = ypos;
    }

    spawn() {
        //Spawn object instance
    }

    move(dx, dy) {
        //Update invader position
    }

    getHit() {
        //Reduce invader hp and check if dead
    }

    shoot() {
        // Fire bullet
    }
}

export default Invader;
