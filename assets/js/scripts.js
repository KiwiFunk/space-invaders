// Import Classes
import Player from './player.js';
import Invader from './invaders.js';

//Global Variables
let player;

//Game State bools
let gameStarted = false;
let gameEnded = false;


//PUT IT ALL IN HERE
document.addEventListener('DOMContentLoaded', function() {





});


//Game Loop
document.addEventListener('DOMContentLoaded', function() {

    //Init game loop on player input
    document.addEventListener('keydown', function(e) {
        //Get playable area
        const gameArea = document.getElementById('gameArea');

        if(!gameStarted) {
            //Start moving invaders
            gameStarted = true;
        }

        //Player Inputs
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            if (player.xpos > 0) {  // Ensure player doesn't move out of bounds
                player.move(-10, 0);  // Move left
            }
        }

        if (e.key === 'ArrowRight' || e.key === 'd') {
            if (player.xpos < gameArea.clientWidth - player.element.offsetWidth) {  // Ensure player stays within bounds
                player.move(10, 0);  // Move right
            }
        }

        if (e.key === ' ') {
            //Fire player bullet
        }

    });

});


//Game Functions

//spawn player

//spawn invaders into an array 

//calculate front facing invaders (for enemy fire logic)

//MOVE FUNCTIONS

//GAME END FUNCTIONS