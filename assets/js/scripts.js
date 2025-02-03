// Import Classes
import Player from './player.js';
import Invader from './invaders.js';

//Object Instances
let player;
let enemyInvaders = [];
let activeBullets = [];

const moveInterval = 300;   // Time in ms between each move
let direction = 1;          // 1 for right, -1 for left

//Game State Bools
let gameStarted = false;
let gameHasEnded = false;

//Menu Functions
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
    
    // Main menu buttons

    //Insert Coin / Start Game
    document.getElementById('startButton').addEventListener('click', function() {
        document.querySelector('.hero').classList.add('hidden');
    });
    
    //Retro Mode
    document.getElementById('retroButton').addEventListener('click', function() {
        this.classList.toggle('active');
        const tvImage = document.getElementById('tvImage');
        const scanlines = document.getElementById('scanlines');
        tvImage.classList.toggle('hidden');
        scanlines.classList.toggle('hidden');
    });

    // Modal functionality
    const instructionsModal = document.getElementById('instructionsModal');
    const pauseMenu = document.getElementById('pauseMenu');
    const hero = document.querySelector('.hero');
    
    // Instructions button
    document.getElementById('instructionsButton').addEventListener('click', function() {
        instructionsModal.classList.remove('hidden');
    });

    // Close instructions via return button
    document.querySelector('.return-button').addEventListener('click', function() {
        instructionsModal.classList.add('hidden');
    });

    // Close instructions when clicking outside
    instructionsModal.addEventListener('click', function(event) {
        if (event.target === instructionsModal) {
            instructionsModal.classList.add('hidden');
        }
    });

    // Pause menu toggle with ESC key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && hero.classList.contains('hidden')) {
            pauseMenu.classList.toggle('hidden');
        }
    });

    // Resume button
    document.querySelector('.resume-button').addEventListener('click', function() {
        pauseMenu.classList.add('hidden');
    });

    // Close pause menu when clicking outside
    pauseMenu.addEventListener('click', function(event) {
        if (event.target === pauseMenu) {
            pauseMenu.classList.add('hidden');
        }
    });

});


//Game Loop
document.addEventListener('DOMContentLoaded', function() {

    //Get playable area
    const gameArea = document.getElementById('gameArea');

    //Start game on button click
    document.getElementById('startButton').addEventListener('click', function() {

        //Init invaders
        initInvaders(gameArea);
        window.addEventListener('resize', function() {
            initInvaders(gameArea); // Recalculate on window resize
        });

        // Player spawn
        spawnPlayer();

        //Start Game
        if(!gameStarted) {
            setInterval(moveInvaders, moveInterval); // Move invaders at set intervals
            gameStarted = true;
        }

        //Start Enemy Attacks
        setInterval(() => {
            frontInvaders();
            handleInvaderShooting();
        }, 1000); // Check every second

        //Get Player Inputs
        document.addEventListener('keydown', function(e) {
            
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

            if (e.key === ' ' && !e.repeat) {
                const bullet = player.shoot();
                activeBullets.push(bullet);
            }
        });

    });   

    setInterval(moveBullets, 20); // Move bullets at set intervals

});


//ASSET SPAWNING

function spawnPlayer() {
    const gameArea = document.getElementById('gameArea');

    // Get player width and height (using a temporary element for measurement)
    const tempPlayer = document.createElement('div');
    tempPlayer.classList.add('player');
    gameArea.appendChild(tempPlayer);
    const playerWidth = tempPlayer.offsetWidth;
    const playerHeight = tempPlayer.offsetHeight;
    gameArea.removeChild(tempPlayer);

    const xpos = gameArea.clientWidth / 2 - playerWidth / 2;
    const ypos = gameArea.clientHeight - playerHeight;

    // Create a new player instance and spawn it
    player = new Player(3, xpos, ypos);     // Store the player instance in the 'player' variable
    player.spawn();                         // Append the player element to the DOM
}


function initInvaders(gameArea, rowLength = 4, maxColumns = 12) {
    // Clear existing invaders IF THINGS ARENT SPAWNING ITS PROLLY THIS
    gameArea.innerHTML = '';
    const gameAreaWidth = gameArea.clientWidth;
    const invaderWidth = 50;    // Width of each invader
    const gap = 35;             // Gap between each invaders

    const columnLength = Math.min(Math.floor(gameAreaWidth / (invaderWidth + gap)), maxColumns);        // Limit to maxColumns
    const offsetX = (gameAreaWidth - (columnLength * (invaderWidth + gap) - gap)) / 2;                  // Center the invaders

    for (let i = 0; i < columnLength; i++) {                        //How many columnts of invaders
        enemyInvaders[i] = [];
        for (let j = 0; j < rowLength; j++) {                       //How many rows of invaders
            const xpos = offsetX + (i * (invaderWidth + gap));
            const ypos = j * (invaderWidth + gap / 1.5);            // Adjust vertical spacing as needed
            enemyInvaders[i][j] = new Invader('invaderBasic', 100, xpos, ypos);
            enemyInvaders[i][j].spawn();
        }
    }
}

//MOVE FUNCTIONS
function moveInvaders(moveDistance = 5) {
    if (gameHasEnded) return;

    const gameArea = document.getElementById('gameArea');
    const gameAreaWidth = gameArea.clientWidth;
    const invaderWidth = enemyInvaders[0][0].element.offsetWidth;

    let edgeReached = false;
    // Check if any invader has reached the edge of the game area
    enemyInvaders.forEach(row => {
        row.forEach(invader => {
            if ((invader.xpos + invaderWidth >= gameAreaWidth && direction > 0) ||
                (invader.xpos <= 0 && direction < 0)) {
                edgeReached = true;
            }
            // Check if any invader has reached the bottom
            if (invader.ypos + invaderWidth >= player.ypos - 50) {
                gameHasEnded = true;
                gameOver('invaders');
            }
        });
    });

    if (edgeReached) {
        // Move all invaders down and change direction
        enemyInvaders.forEach(row => {
            row.forEach(invader => {
                //Alter the vertical move distance as needed
                invader.move(0, 50);
            });
        });
        direction *= -1; // Change direction
    } else {
        // Move all invaders horizontally
        enemyInvaders.forEach(row => {
            row.forEach(invader => {
                invader.move(moveDistance * direction, 0);
            });
        });
    }
}

//ATTACK FUNCTIONS

function moveBullets() {
    // Move each bullet and remove those that are out of bounds
    activeBullets = activeBullets.filter(bullet => {
        const isActive = bullet.move();
        if (!isActive) {
            bullet.remove();
        }

        // Check if enemy bullet hits player
        if (bullet.direction === 1 && checkCollision(bullet, player)) { // Enemy bullet
            const playerHit = player.getHit();
            if (playerHit) {
                gameHasEnded = true;
                gameOver('invaders');
            }
            bullet.remove();
            return false;
        }

        return isActive;
    });

    // Check for collisions with invaders
    activeBullets = activeBullets.filter(bullet => {
        let bulletHit = false;

        enemyInvaders.forEach((row, rowIndex) => {
            row.forEach((invader, col) => {
                if (invader && checkCollision(bullet, invader)) { 

                    // Call getHit(). If invader was destroyed, remove from array.
                    const invaderDestroyed = invader.getHit(); 
                    if (invaderDestroyed) row.splice(col, 1);

                    // Check if every invader in the array has been destroyed
                    //Last modification to function. If any freezing occurs, check here
                    if (enemyInvaders.every(row => row.length === 0)) {
                        gameHasEnded = true;
                        gameOver('player');
                    }
                   
                    bullet.remove();
                    bulletHit = true;
                }
            });
        });
        return !bulletHit;
    });
}

function checkCollision(bullet, target) {
    // Get bounding boxes for bullet and target 
    const errorMargin = 1; // Increase the hitbox of the target

    const bulletBB = {
        left: bullet.xpos,
        right: bullet.xpos + bullet.element.offsetWidth,
        top: bullet.ypos,
        bottom: bullet.ypos + bullet.element.offsetHeight
    };

    const targetBB = {
        left: target.xpos - errorMargin,
        right: target.xpos + target.element.offsetWidth + errorMargin,
        top: target.ypos - errorMargin,
        bottom: target.ypos + target.element.offsetHeight + errorMargin
    };

    //Return bool if collision is detected
    return !(bulletBB.right < targetBB.left ||
             bulletBB.left > targetBB.right ||
             bulletBB.bottom < targetBB.top ||
             bulletBB.top > targetBB.bottom);
}

function frontInvaders() {
    // Reset all invaders canShoot property
    enemyInvaders.forEach(column => {
        column.forEach(invader => {
            invader.canShoot = false;
        });
    });

    //Find the highest index for each column, set canShoot to true
    enemyInvaders.forEach(column => {
        if (column.length > 0) {
            let index = column.length - 1;      //Arrays are zero indexed
            column[index].canShoot = true; 
        }
    });
}

function handleInvaderShooting() {
    if (gameHasEnded) return;
    
    enemyInvaders.forEach(column => {
        column.forEach(invader => {
            if (invader && invader.canShoot && Math.random() < 0.15) { // 15% chance to shoot
                const bullet = invader.shoot();
                if (bullet) {
                    activeBullets.push(bullet);
                }
            }
        });
    });
}



//GAME END FUNCTIONS
function gameOver(winner) {
    //Clear Game Area on end state
    gameArea.innerHTML = '';
    
    if (winner === 'player') {
        alert('Congratulations! You have defeated the invaders!');
    }
    //if winner = player
    if (winner === 'invaders') {
        alert('Game Over! The invaders have reached the bottom.');
    }
    
}

//MENU FUNCTIONS

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