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
    
    // Touch position
    let touchX = 0;
    let touchY = 0;
    let isTouching = false;

    // Movement
    function handleMove(e) {
        const layers = document.querySelectorAll('.layer');
        const speed = 0.05;
        const maxScale = 1.5;
    
        // Get the cursor or touch position
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // Parallax layers
        layers.forEach(layer => {
            const rect = layer.getBoundingClientRect();
            const layerCenterX = rect.left + rect.width / 2;
            const layerCenterY = rect.top + rect.height / 2;
            const distanceX = Math.abs(layerCenterX - clientX);
            const distanceY = Math.abs(layerCenterY - clientY);
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            const maxDistance = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight);
            const scale = 1 + (maxScale - 1) * (1 - distance / maxDistance);
    
            const x = (window.innerWidth / 2 - clientX) * speed;
            const y = (window.innerHeight / 2 - clientY) * speed;
    
            layer.style.transition = 'transform 0.1s ease-out';
            layer.style.transform = `translateX(${x}px) translateY(${y}px) scale(${scale})`;
        });
    }
    
    // Update touch position
    function updateTouchPosition() {
        if (isTouching) {
            handleMove({ clientX: touchX, clientY: touchY });
            requestAnimationFrame(updateTouchPosition);
        }
    }
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', function(e) {
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
        if (!isTouching) {
            isTouching = true;
            requestAnimationFrame(updateTouchPosition);
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function() {
        isTouching = false;
    });
    
    // Button listeners
    document.getElementById('startButton').addEventListener('click', function() {
        document.querySelector('.hero').classList.add('hidden');
    });
    
    document.getElementById('retroButton').addEventListener('click', function() {
        this.classList.toggle('active');
        const tvImage = document.getElementById('tvImage');
        const scanlines = document.getElementById('scanlines');
        tvImage.classList.toggle('hidden');
        scanlines.classList.toggle('hidden');
    });



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