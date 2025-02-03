// Import Classes
import Player from './player.js';
import Invader from './invaders.js';

//Global Variables
let player;
let enemyInvaders = [];

const rowLength = 4;
const invaderWidth = 50;    // Width of each invader
const gap = 35;             // Gap between invaders
const maxColumns = 10;      // Maximum number of columns
const moveInterval = 300;   // Time in ms between each move
const moveDistance = 5;     // Distance to move in each step
let direction = 1;          // 1 for right, -1 for left

//Game State bools
let gameStarted = false;
let gameEnded = false;


//PUT IT ALL IN HERE
document.addEventListener('DOMContentLoaded', function() {
    
    // Touch position
    let touchX = 0;
    let touchY = 0;
    let isTouching = false;

    // Handle the parallax effect on mousemove
    document.addEventListener('mousemove', function(e) {
        handleMove(e);
    });
    
    // Update touch position
    function updateTouchPosition() {
        if (isTouching) {
            handleMove({ clientX: touchX, clientY: touchY });
            requestAnimationFrame(updateTouchPosition);
        }
    }
    
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

    // Modal functionality
    const instructionsButton = document.getElementById('instructionsButton');
    const instructionsModal = document.getElementById('instructionsModal');
    const returnButton = document.querySelector('.return-button');
    const pauseMenu = document.getElementById('pauseMenu');
    const resumeButton = document.querySelector('.resume-button');
    const hero = document.querySelector('.hero');

    instructionsButton.addEventListener('click', function() {
        instructionsModal.style.display = 'block';
        requestAnimationFrame(() => {
            instructionsModal.classList.add('show');
        });
    });

    returnButton.addEventListener('click', function() {
        instructionsModal.classList.remove('show');
        setTimeout(() => {
            instructionsModal.style.display = 'none';
        }, 500); // Wait for the fade-out transition to complete
    });

    window.addEventListener('click', function(event) {
        if (event.target === instructionsModal) {
            instructionsModal.classList.remove('show');
            setTimeout(() => {
                instructionsModal.style.display = 'none';
            }, 500); // Wait for the fade-out transition to complete
        }
    });

    // Pause menu functionality
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && hero.classList.contains('hidden')) {
            if (pauseMenu.style.display === 'block') {
                pauseMenu.classList.remove('show');
                setTimeout(() => {
                    pauseMenu.style.display = 'none';
                }, 500); // Wait for the fade-out transition to complete
            }
            else {
                pauseMenu.style.display = 'block';
                requestAnimationFrame(() => {
                    pauseMenu.classList.add('show');
                });
            }
        }
    });

    resumeButton.addEventListener('click', function() {
        pauseMenu.classList.remove('show');
        setTimeout(() => {
            pauseMenu.style.display = 'none';
        }, 500); // Wait for the fade-out transition to complete
    });

    window.addEventListener('click', function(event) {
        if (event.target === pauseMenu) {
            pauseMenu.classList.remove('show');
            setTimeout(() => {
                pauseMenu.style.display = 'none';
            }, 500); // Wait for the fade-out transition to complete
        }
    });

});


//Game Loop
document.addEventListener('DOMContentLoaded', function() {

    //Get playable area
    const gameArea = document.getElementById('gameArea');

    //Invader Initialization

    document.getElementById('startButton').addEventListener('click', function() {
        initInvaders(gameArea);
        window.addEventListener('resize', function() {
            initInvaders(gameArea); // Recalculate on window resize
        });
    });




    
    //Init game loop on player input
    document.addEventListener('keydown', function(e) {
        

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

//Visual Menu
function handleMove(event) {
    
    const layers = document.querySelectorAll('.layer');
    const speed = 0.05;
    const maxScale = 1.5;

    // Get the cursor or touch position
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

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

//Game Functions

function initInvaders(gameArea) {
    gameArea.innerHTML = ''; // Clear existing invaders IF THINGS ARENT SPAWNING ITS PROLLY THIS
    const gameAreaWidth = gameArea.clientWidth;

    const columnLength = Math.min(Math.floor(gameAreaWidth / (invaderWidth + gap)), maxColumns); // Limit to maxColumns
    const offsetX = (gameAreaWidth - (columnLength * (invaderWidth + gap) - gap)) / 2; // Center the invaders

    for (let j = 0; j < columnLength; j++) {
        enemyInvaders[j] = [];
        for (let i = 0; i < rowLength; i++) {
            const xpos = offsetX + (j * (invaderWidth + gap));
            const ypos = i * (invaderWidth + gap / 1.5); // Adjust vertical spacing as needed
            enemyInvaders[j][i] = new Invader('invaderBasic', 100, xpos, ypos);
            enemyInvaders[j][i].spawn();
        }
    }
}

//spawn player

//spawn invaders into an array 

//calculate front facing invaders (for enemy fire logic)

//MOVE FUNCTIONS

//GAME END FUNCTIONS