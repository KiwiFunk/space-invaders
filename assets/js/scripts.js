// Import Classes
import Player from "./player.js";
import Invader from "./invaders.js";

//Object Instances
let player;
let enemyInvaders = [];
let activeBullets = [];

let direction = 1; // 1 for right, -1 for left

//Game State Bools
let gameStarted = false;
let gameHasEnded = false;

let paused = false;
let pauseStartTime = 0;

let gameRound = 1;

//Audio load
const backgroundMusic = new Audio("assets/audio/BG.wav");
const shootSound = new Audio("assets/audio/laser.wav");
const invaderHit = new Audio("assets/audio/explosion.wav");
const invaderShoot = new Audio("assets/audio/invaderlaser.wav");
const playerGotHit = new Audio("assets/audio/PlayerHit.wav");
const gameOverSound = new Audio("assets/audio/game-over.wav");

backgroundMusic.volume = 0.6;
shootSound.volume = 0.2;
invaderHit.volume = 0.2;
invaderShoot.volume = 0.2;
playerGotHit.volume = 0.2;
gameOverSound.volume = 0.7;

// Key Inputs
const keys = {
    left: false,
    right: false,
    space: false,
};

let animationFrameId = null;

//Adjust player speed
const PLAYER_SPEED = 5;

document.addEventListener("DOMContentLoaded", function () {
    // Touch position
    let touchX = 0;
    let touchY = 0;
    let isTouching = false;

    // Handle the parallax effect on mousemove
    document.addEventListener("mousemove", function (e) {
        handleMove(e);
    });

    // Update touch position
    function updateTouchPosition() {
        if (isTouching) {
            handleMove({ clientX: touchX, clientY: touchY });
            requestAnimationFrame(updateTouchPosition);
        }
    }

    document.addEventListener(
        "touchmove",
        function (e) {
            touchX = e.touches[0].clientX;
            touchY = e.touches[0].clientY;
            if (!isTouching) {
                isTouching = true;
                requestAnimationFrame(updateTouchPosition);
            }
        },
        { passive: true }
    );

    document.addEventListener("touchend", function () {
        isTouching = false;
    });

    //Insert Coin / Start Game
    document
        .getElementById("startButton")
        .addEventListener("click", function () {
            document.querySelector(".hero").classList.add("hidden");
            //START GAME
            backgroundMusic.loop = true;
            backgroundMusic.play();
            lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        });

    //Retro Mode
    document
        .getElementById("retroButton")
        .addEventListener("click", function () {
            this.classList.toggle("active");
            const tvImage = document.getElementById("tvImage");
            const scanlines = document.getElementById("scanlines");
            tvImage.classList.toggle("hidden");
            scanlines.classList.toggle("hidden");
        });

    setupMenuAndModals(); // Init modals (Instructions and Pause Menu)

    // Listeners for player movement
    document.addEventListener("keydown", (e) => {
        if (!gameStarted || gameHasEnded) return;
        switch (e.code) {
            case "ArrowLeft":
            case "KeyA":
                keys.left = true;
                break;
            case "ArrowRight":
            case "KeyD":
                keys.right = true;
                break;
            case "Space":
                keys.space = true;
                break;
        }
    });

    document.addEventListener("keyup", (e) => {
        switch (e.code) {
            case "ArrowLeft":
            case "KeyA":
                keys.left = false;
                break;
            case "ArrowRight":
            case "KeyD":
                keys.right = false;
                break;
            case "Space":
                keys.space = false;
                break;
        }
    });

    // Volume sliders
    const musicVolumeSlider = document.getElementById("musicVolume");
    const effectsVolumeSlider = document.getElementById("effectsVolume");
    const muteMusicButton = document.getElementById("muteMusicButton");
    const muteEffectsButton = document.getElementById("muteEffectsButton");

    musicVolumeSlider.addEventListener("input", function () {
        const volume = musicVolumeSlider.value / 100;
        backgroundMusic.volume = volume;
    });

    effectsVolumeSlider.addEventListener("input", function () {
        const volume = effectsVolumeSlider.value / 100;
        shootSound.volume = volume;
        invaderHit.volume = volume;
        invaderShoot.volume = volume;
    });

    muteMusicButton.addEventListener("click", function () {
        if (backgroundMusic.muted) {
            backgroundMusic.muted = false;
            muteMusicButton.textContent = "Mute";
        } else {
            backgroundMusic.muted = true;
            muteMusicButton.textContent = "Unmute";
        }
    });

    muteEffectsButton.addEventListener("click", function () {
        const isMuted = shootSound.muted;
        shootSound.muted = !isMuted;
        invaderHit.muted = !isMuted;
        invaderShoot.muted = !isMuted;
        muteEffectsButton.textContent = isMuted ? "Mute" : "Unmute";
    });

    initializeHighScores(); // Initialize high scores
});

// Player Controls
function updatePlayer() {
    const gameArea = document.getElementById("gameArea");

    if (keys.left && player.xpos > 0) {
        player.move(-PLAYER_SPEED, 0);
    }
    if (
        keys.right &&
        player.xpos < gameArea.clientWidth - player.element.offsetWidth
    ) {
        player.move(PLAYER_SPEED, 0);
    }
    if (keys.space && !player.shootCooldown) {
        playerShoot();
        player.shootCooldown = true;
        setTimeout(() => (player.shootCooldown = false), 500);
    }
}

//GAME LOOP
let lastTime = 0;
let deltaTime = 0;
let accumulatedTime = 0;

const FPS = 60;
const frameTime = 1000 / FPS; // Target time per frame in ms

let moveAccumulator = 0;
let shootAccumulator = 0;

let moveInterval = 300; // Invader move speed
let shootInterval = 1500; // Invader shoot speed

function gameLoop(timestamp) {
    if (gameHasEnded) return; // If the game has ended, stop the game loop
    const gameArea = document.getElementById("gameArea");

    if (!gameStarted) {
        // If the game hasnt been started yet, start it and spawn player and invaders
        gameStarted = true;
        spawnPlayer(gameArea);
        initInvaders(gameArea);
        if (
            document
                .getElementsByClassName("gameOverlay")[0]
                .classList.contains("hidden")
        ) {
            toggleGameOverlay();
        }
        updatePlayerLives();
    }

    if (!paused) {
        // Only update the game state if not paused
        const deltaTime = Math.min(timestamp - lastTime, 50); // Calculate the delta time (difference from the previous frame) Cap to prevent large jumps.
        lastTime = timestamp;

        accumulatedTime += deltaTime; // Accumulate the time passed for frame-based processing

        if (accumulatedTime >= frameTime) {
            // If enough time has passed to process a new frame, continue

            accumulatedTime -= frameTime; // Reset accumulated time after processing frame logic
            moveAccumulator += deltaTime; // Time step accumulators for movement and shooting
            shootAccumulator += deltaTime;

            updatePlayer(); // Update player movement

            while (moveAccumulator >= moveInterval) {
                // Update game logic
                moveInvaders();
                moveAccumulator -= moveInterval;
            }
            while (shootAccumulator >= shootInterval) {
                handleInvaderShooting();
                shootAccumulator -= shootInterval;
            }
            updateBullets();
        }
    }

    animationFrameId = requestAnimationFrame(gameLoop); // Request next frame
}

function setNewIntervals() {
    // Increase difficulty by decreasing intervals
    moveInterval = Math.max(Math.ceil(moveInterval - 25), 50);
    shootInterval = Math.max(Math.ceil(shootInterval - 200), 200);
}

function playerShoot() {
    shootSound.currentTime = 0; // Reset the sound to the beginning
    shootSound.play();
    const bullet = player.shoot(); // Create a bullet object
    activeBullets.push(bullet); // Append bullet object to the activeBullets array
}

function toggleGameOverlay() {
    const overlay = document.getElementsByClassName("gameOverlay")[0];
    overlay.classList.toggle("hidden");
}

function updatePlayerLives() {
    const playerLives = document.getElementById("lives");
    playerLives.innerText = `LIVES: ${player.lives}`;
}

function updatePlayerScore(scoreValue) {
    const finalScore = document.getElementById("finalScore");
    const playerScore = document.getElementById("score");
    let totalScore = parseInt(playerScore.innerText.split(" ")[1], 10);
    totalScore += scoreValue;
    playerScore.innerText = `SCORE: ${totalScore.toString().padStart(6, "0")}`;
    finalScore.innerText = totalScore.toString().padStart(6, "0");
}

//ASSET SPAWNING FUNCTIONS

function spawnPlayer(gameArea) {
    // Calculate width and height of player sprite. (PLEASE TELL ME THERE IS A BETTER WAY)
    const tempPlayer = document.createElement("div");
    tempPlayer.classList.add("player");
    gameArea.appendChild(tempPlayer);
    const playerWidth = tempPlayer.offsetWidth;
    const playerHeight = tempPlayer.offsetHeight;
    gameArea.removeChild(tempPlayer);

    const xpos = gameArea.clientWidth / 2 - playerWidth / 2;
    const ypos = gameArea.clientHeight - playerHeight;

    player = new Player(3, xpos, ypos); // Create and store an instance of the player class
    player.spawn(); // Append the player object to the DOM
}

function initInvaders(gameArea, rowLength = 4, maxColumns = 12) {
    const gameAreaWidth = gameArea.clientWidth;
    const invaderWidth = 50; // Width of each invader
    const gap = 35; // Gap between each invaders

    const columnLength = Math.min(
        Math.floor(gameAreaWidth / (invaderWidth + gap)),
        maxColumns
    ); // Limit to maxColumns
    const offsetX =
        (gameAreaWidth - (columnLength * (invaderWidth + gap) - gap)) / 2; // Center the invaders

    for (let i = 0; i < columnLength; i++) {
        //How many columnts of invaders
        enemyInvaders[i] = [];
        for (let j = 0; j < rowLength; j++) {
            //How many rows of invaders
            const xpos = offsetX + i * (invaderWidth + gap);
            const ypos = j * (invaderWidth + gap / 1.5); // Adjust vertical spacing as needed
            enemyInvaders[i][j] = new Invader("green", 100, xpos, ypos, 100);
            enemyInvaders[i][j].spawn();
        }
    }
}

//MOVE FUNCTIONS
function moveInvaders(moveDistance = 5) {
    if (gameHasEnded) return;

    const gameArea = document.getElementById("gameArea");
    const gameAreaWidth = gameArea.clientWidth;
    // Calculate width of an invader using any reamining invader object
    const invaderWidth = enemyInvaders
        .flat()
        .find((invader) => invader !== undefined).element.offsetWidth;

    let edgeReached = false;
    // Check if any invader has reached the edge of the game area
    enemyInvaders.forEach((row) => {
        row.forEach((invader) => {
            if (
                (invader.xpos + invaderWidth >= gameAreaWidth &&
                    direction > 0) ||
                (invader.xpos <= 0 && direction < 0)
            ) {
                edgeReached = true;
            }
            // Check if any invader has reached the bottom
            if (invader.ypos + invaderWidth >= player.ypos - 50) {
                gameHasEnded = true;
                gameOver("invaders");
            }
        });
    });

    if (edgeReached) {
        // Move all invaders down and change direction
        enemyInvaders.forEach((row) => {
            row.forEach((invader) => {
                //Alter the vertical move distance as needed
                invader.move(0, 50);
            });
        });
        direction *= -1; // Change direction
    } else {
        // Move all invaders horizontally
        enemyInvaders.forEach((row) => {
            row.forEach((invader) => {
                invader.move(moveDistance * direction, 0);
            });
        });
    }
}
// Show touch controls on mobile/tablet
function showTouchControls() {
    const touchControls = document.getElementById("touchControls");
    if (window.innerWidth <= 768) {
        // Adjust breakpoint as needed
        touchControls.classList.remove("hidden");
    } else {
        touchControls.classList.add("hidden");
    }
}

window.addEventListener("resize", showTouchControls);
showTouchControls();

// Touch control logic
const joystick = document.getElementById("joystick");
const fireButton = document.getElementById("fireButton");

let joystickActive = false;
let joystickStartX = 0;
let joystickCurrentX = 0;

joystick.addEventListener("touchstart", function (e) {
    joystickActive = true;
    joystickStartX = e.touches[0].clientX;
    joystickCurrentX = joystickStartX;
});

joystick.addEventListener("touchmove", function (e) {
    if (!joystickActive) return;
    joystickCurrentX = e.touches[0].clientX;
    const deltaX = joystickCurrentX - joystickStartX;
    if (deltaX < -10) {
        keys.left = true;
        keys.right = false;
    } else if (deltaX > 10) {
        keys.left = false;
        keys.right = true;
    } else {
        keys.left = false;
        keys.right = false;
    }
});

joystick.addEventListener("touchend", function () {
    joystickActive = false;
    keys.left = false;
    keys.right = false;
});

fireButton.addEventListener("touchstart", function () {
    keys.space = true;
});

fireButton.addEventListener("touchend", function () {
    keys.space = false;
});

//ATTACK FUNCTIONS

function updateBullets() {
    activeBullets = activeBullets.filter((bullet) => {
        const isActive = bullet.move();
        if (!isActive) {
            bullet.remove();
        }

        if (bullet.direction === 1 && checkCollision(bullet, player)) {
            const playerHit = player.getHit();
            playerGotHit.play();
            updatePlayerLives();
            if (playerHit) {
                gameOver("invaders");
            }
            bullet.remove();
            return false;
        }

        return isActive;
    });

    activeBullets = activeBullets.filter((bullet) => {
        let bulletHit = false;

        enemyInvaders.forEach((row, rowIndex) => {
            row.forEach((invader, col) => {
                if (invader && checkCollision(bullet, invader)) {
                    const invaderDestroyed = invader.getHit();
                    if (invaderDestroyed) {
                        //If invader is destroyed
                        updatePlayerScore(invader.scoreValue); //Update player score
                        invader.despawn(); //Remove invader from DOM
                        row.splice(col, 1); //Remove invader array entry
                        invaderHit.play(); //Play invader hit sound
                    }

                    if (enemyInvaders.every((row) => row.length === 0)) {
                        gameOver("player");
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
        bottom: bullet.ypos + bullet.element.offsetHeight,
    };

    const targetBB = {
        left: target.xpos - errorMargin,
        right: target.xpos + target.element.offsetWidth + errorMargin,
        top: target.ypos - errorMargin,
        bottom: target.ypos + target.element.offsetHeight + errorMargin,
    };

    //Return bool if collision is detected
    return !(
        bulletBB.right < targetBB.left ||
        bulletBB.left > targetBB.right ||
        bulletBB.bottom < targetBB.top ||
        bulletBB.top > targetBB.bottom
    );
}

function frontInvaders() {
    // Reset all invaders canShoot property
    enemyInvaders.forEach((column) => {
        column.forEach((invader) => {
            invader.canShoot = false;
        });
    });

    //Find the highest index for each column, set canShoot to true
    enemyInvaders.forEach((column) => {
        if (column.length > 0) {
            let index = column.length - 1; //Arrays are zero indexed
            column[index].canShoot = true;
        }
    });
}

function handleInvaderShooting() {
    // Check which invaders can shoot
    frontInvaders();

    enemyInvaders.forEach((column) => {
        column.forEach((invader) => {
            if (invader && invader.canShoot && Math.random() < 0.15) {
                // 15% chance to shoot
                const bullet = invader.shoot();
                invaderShoot.play();
                if (bullet) {
                    activeBullets.push(bullet);
                }
            }
        });
    });
}

//GAME END FUNCTIONS
function gameOver(winner) {
    if (winner === "player") {
        // Clear all invaders and bullets
        enemyInvaders.forEach((row) => {
            row.forEach((invader) => {
                invader.despawn();
            });
        });
        enemyInvaders = [];
        activeBullets = [];

        // Update intervals for increased difficulty
        setNewIntervals();

        // Reset accumulators
        moveAccumulator = 0;
        shootAccumulator = 0;

        // Spawn new invaders for next round
        const gameArea = document.getElementById("gameArea");
        initInvaders(gameArea);

        // Update round counter
        gameRound++;
        const gameRoundElement = document.getElementById("gameRound");
        gameRoundElement.innerText = `ROUND: ${gameRound}`;

        // Continue game loop
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    if (winner === "invaders") {
        gameHasEnded = true;
        gameOverSound.play();

        // Get final score before clearing game area
        const currentScore = parseInt(
            document.getElementById("score").innerText.split(" ")[1]
        );

        const gameArea = document.getElementById("gameArea");
        gameArea.innerHTML = "";

        checkHighScore(currentScore); // Check highscore and show modal if needed
    }
}

//Reset the game state
function resetGame() {
    resetUIElements();

    resetGameState();

    clearGameObjects();

    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
}

//MENU FUNCTIONS

//Visual Menu
function handleMove(event) {
    const layers = document.querySelectorAll(".layer");
    const speed = 0.05;
    const maxScale = 1.5;

    // Get the cursor or touch position
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    // Parallax layers
    layers.forEach((layer) => {
        const rect = layer.getBoundingClientRect();
        const layerCenterX = rect.left + rect.width / 2;
        const layerCenterY = rect.top + rect.height / 2;
        const distanceX = Math.abs(layerCenterX - clientX);
        const distanceY = Math.abs(layerCenterY - clientY);
        const distance = Math.sqrt(
            distanceX * distanceX + distanceY * distanceY
        );
        const maxDistance = Math.sqrt(
            window.innerWidth * window.innerWidth +
                window.innerHeight * window.innerHeight
        );
        const scale = 1 + (maxScale - 1) * (1 - distance / maxDistance);

        const x = (window.innerWidth / 2 - clientX) * speed;
        const y = (window.innerHeight / 2 - clientY) * speed;

        layer.style.transition = "transform 0.1s ease-out";
        layer.style.transform = `translateX(${x}px) translateY(${y}px) scale(${scale})`;
    });
}

function setupMenuAndModals() {
    const instructionsModal = document.getElementById("instructionsModal");
    const pauseMenu = document.getElementById("pauseMenu");
    const settingsMenu = document.getElementById("settingsMenu");
    const instructionsPauseMenu = document.getElementById(
        "instructionsPauseMenu"
    );
    const hero = document.querySelector(".hero");

    // Instructions button in main menu
    document
        .getElementById("instructionsButton")
        .addEventListener("click", function () {
            updateInstructionsText();
            instructionsModal.classList.remove("hidden");
        });

    // Close instructions via return button in main menu
    document
        .querySelector("#instructionsModal .btn-alt")
        .addEventListener("click", function () {
            instructionsModal.classList.add("hidden");
        });

    // Close instructions when clicking outside in main menu
    instructionsModal.addEventListener("click", function (event) {
        if (event.target === instructionsModal) {
            instructionsModal.classList.add("hidden");
        }
    });

    // Pause menu toggle with ESC key
    document.addEventListener("keydown", function (event) {
        const settingsMenu = document.getElementById("settingsMenu");
        const instructionsPauseMenu = document.getElementById(
            "instructionsPauseMenu"
        );
        if (event.key === "Escape" && hero.classList.contains("hidden")) {
            togglePauseMenu();
            if (
                !settingsMenu.classList.contains("hidden") ||
                !instructionsPauseMenu.classList.contains("hidden")
            ) {
                settingsMenu.classList.add("hidden");
                instructionsPauseMenu.classList.add("hidden");
                pauseMenu.classList.add("hidden");
            }
        }
    });

    // Resume button
    document
        .getElementById("resumeButton")
        .addEventListener("click", function () {
            togglePauseMenu();
        });

    // Main menu button
    document
        .getElementById("menuMainButton")
        .addEventListener("click", function () {
            mainMenuReturn();
            const pauseMenu = document.getElementById("pauseMenu");
            pauseMenu.classList.add("hidden");
        });

    // Close pause menu when clicking outside
    pauseMenu.addEventListener("click", function (event) {
        if (event.target === pauseMenu) {
            togglePauseMenu();
        }
    });

    // Settings button
    document
        .getElementById("settingsButton")
        .addEventListener("click", function () {
            pauseMenu.classList.add("hidden");
            settingsMenu.classList.remove("hidden");
        });

    // Return to Pause Menu button in settings
    document
        .getElementById("returnToPauseButton")
        .addEventListener("click", function () {
            settingsMenu.classList.add("hidden");
            pauseMenu.classList.remove("hidden");
        });

    // Close settings menu when clicking outside
    settingsMenu.addEventListener("click", function (event) {
        if (event.target === settingsMenu) {
            settingsMenu.classList.add("hidden");
            pauseMenu.classList.remove("hidden");
        }
    });

    // Instructions button in pause menu
    document
        .getElementById("pauseInstructionsButton")
        .addEventListener("click", function () {
            updateInstructionsText();
            pauseMenu.classList.add("hidden");
            instructionsPauseMenu.classList.remove("hidden");
        });

    // Return to Pause Menu button in instructionsPauseMenu
    document
        .getElementById("returnToPauseFromInstructionsButton")
        .addEventListener("click", function () {
            instructionsPauseMenu.classList.add("hidden");
            pauseMenu.classList.remove("hidden");
        });

    // Close instructionsPauseMenu when clicking outside
    instructionsPauseMenu.addEventListener("click", function (event) {
        if (event.target === instructionsPauseMenu) {
            instructionsPauseMenu.classList.add("hidden");
            pauseMenu.classList.remove("hidden");
        }
    });

    // Retry button
    document
        .getElementById("retryButton")
        .addEventListener("click", function () {
            resetGame();
            pauseMenu.classList.add("hidden");
        });
}

function updateInstructionsText() {
    const instructionsList = document.querySelectorAll(".instructions");
    const isMobile = window.innerWidth <= 768; // Adjust breakpoint as needed

    instructionsList.forEach((instructions) => {
        instructions.innerHTML = isMobile
            ? `
            <li>Destroy enemies by using the on-screen joystick to move.</li>
            <li>Use the on-screen fire button to shoot.</li>
            <li><u>Stay alive</u> and <u>defend earth!</u></li>
        `
            : // Update instructions text for mobile devices
              `
            <li>Destroy enemies by using <b>Left</b> and <b>Right</b> or the <b>A</b> and <b>D</b> keys to move.</li>
            <li>Use the <b>Spacebar</b> to shoot.</li>
            <li><u>Stay alive</u> and <u>defend earth!</u></li>
        `;
        // Update instructions text for desktop devices
    });
}

// Function to toggle the pause menu
function togglePauseMenu() {
    const pauseMenu = document.getElementById("pauseMenu");
    pauseMenu.classList.toggle("hidden");

    if (!gameHasEnded) {
        paused = !paused;

        if (paused) {
            pauseStartTime = performance.now();
            backgroundMusic.pause();
        } else {
            // Reset timing on unpause
            lastTime = performance.now();
            moveAccumulator = 0;
            shootAccumulator = 0;
            accumulatedTime = 0;
            backgroundMusic.play();
        }
    }
}

// GAME OVER MENU FUNCTIONS
function gameOverButtons() {
    const gameOverRetry = document.getElementById("newGameButton");
    const mainMenuButton = document.getElementById("mainMenuButtonGO");

    gameOverRetry.addEventListener("click", function () {
        gameHasEnded = false;
        resetGame();
        lastTime = performance.now(); // Reset timing
        requestAnimationFrame(gameLoop); // Restart game loop
        const gameOverScreen = document.getElementById("GameOverScreen");
        gameOverScreen.classList.add("hidden");
    });

    mainMenuButton.addEventListener("click", function () {
        mainMenuReturn();
    });
}

function mainMenuReturn() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Reset UI elements
    resetUIElements();

    // Reset game state
    resetGameState();

    // Reset game objects
    clearGameObjects();

    // Show main menu
    showMainMenu();
}

function resetUIElements() {
    // Hide all screens except main menu
    const screens = {
        gameOver: document.getElementById("GameOverScreen"),
        overlay: document.querySelector(".gameOverlay"),
        pauseMenu: document.getElementById("pauseMenu"),
        settingsMenu: document.getElementById("settingsMenu"),
        instructionsMenu: document.getElementById("instructionsPauseMenu"),
    };

    Object.values(screens).forEach((screen) => {
        if (screen) screen.classList.add("hidden");
    });

    // Reset score and round displays
    document.getElementById("score").innerText = "SCORE: 000000";
    document.getElementById("gameRound").innerText = "ROUND: 1";
}

function resetGameState() {
    // Reset game flags
    gameStarted = false;
    gameHasEnded = false;
    paused = false;

    // Reset timing variables
    moveAccumulator = 0;
    shootAccumulator = 0;
    pauseStartTime = 0;
    lastTime = 0;

    // Reset game settings
    moveInterval = 300;
    shootInterval = 1500;
    gameRound = 1;

    // Reset audio
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function clearGameObjects() {
    // Clear game area
    const gameArea = document.getElementById("gameArea");
    gameArea.innerHTML = "";

    // Clear invaders
    enemyInvaders.forEach((row) => {
        row.forEach((invader) => invader.despawn());
    });
    enemyInvaders = [];

    // Clear player
    if (player) {
        player.despawn();
        player = null;
    }

    // Clear bullets
    activeBullets.forEach((bullet) => bullet.remove());
    activeBullets = [];
}

function showMainMenu() {
    document.querySelector(".hero").classList.remove("hidden");
}

// High Score Management
const HIGH_SCORES_KEY = "spaceInvadersHighScores";
const MAX_HIGH_SCORES = 5;

function initializeHighScores() {
    // Check if high scores exist in localStorage
    if (!localStorage.getItem(HIGH_SCORES_KEY)) {
        // Default high scores
        const defaultScores = [
            { name: "V", score: 60000 },
            { name: "B4NDIT", score: 47900 },
            { name: "RAZOR", score: 18400 },
            { name: "KENJI", score: 12600 },
            { name: "ROSCOE", score: 700 },
        ];
        localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(defaultScores));
    }
    updateHighScoreDisplay();
}

function checkHighScore(currentScore) {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY));
    const lowestScore = highScores[highScores.length - 1].score;

    if (currentScore > lowestScore) {
        const highscoreModal = document.getElementById("highscoreModal");
        const highscoreNameInput =
            document.getElementById("highscoreNameInput");
        const submitHighscoreButton = document.getElementById(
            "submitHighscoreButton"
        );

        highscoreModal.classList.remove("hidden");

        submitHighscoreButton.addEventListener("click", function () {
            const playerName = highscoreNameInput.value
                .trim()
                .slice(0, 6)
                .toUpperCase();
            if (playerName) {
                addHighScore({
                    name: playerName,
                    score: currentScore,
                });
                highscoreModal.classList.add("hidden");
                showGameOverScreen(); // Show game over screen after submitting highscore
            }
        });

        return true;
    } else {
        showGameOverScreen(); // Show game over screen if not a highscore
    }
    return false;
}

function showGameOverScreen() {
    const gameOverScreen = document.getElementById("GameOverScreen");
    gameOverScreen.classList.remove("hidden");
    gameOverButtons();
}

function addHighScore(newScore) {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY));
    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(MAX_HIGH_SCORES); // Keep only top 5
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
    updateHighScoreDisplay();
}

function updateHighScoreDisplay() {
    const highScoreList = document.getElementById("highscoreList");
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY));

    highScoreList.innerHTML = highScores
        .map(
            (score) => `
        <li>
            <span class="highscoreName">${score.name}</span>
            <span class="highscoreScore">${score.score
                .toString()
                .padStart(6, "0")}</span>
        </li>
    `
        )
        .join("");
}
