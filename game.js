const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const game = new Phaser.Game(config);

let pumpButton;
let string;
let balloon;
let letter;
let inflationCount = 0;
let burstEmitter;

function create() {
    // Set background image and resize correctly
    const bg = this.add.image(0, 0, 'background').setOrigin(0).setScale(1);
    resizeBackground(bg, this);

    // Create pump button
    createPump(this);

    // Full-Screen Toggle
    this.input.keyboard.on('keydown-F', () => {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        } else {
            this.scale.startFullscreen();
        }
    });

    // Create the particle emitter for the burst effect
    const particles = this.add.particles('balloon-1');
    burstEmitter = particles.createEmitter({
        speed: 200,
        scale: { start: 1, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        lifespan: 500,
        frequency: 50,
        quantity: 10,
        on: false,
    });
}

function preload() {
    // Load all necessary images
    this.load.image('background', 'assets/Symbol 3 copy.png');
    this.load.image('pump', 'assets/Symbol 28.png');
    for (let i = 100001; i <= 100010; i++) {
        this.load.image(`balloon-${i - 100000}`, `assets/Symbol ${i}.png`);
    }
    this.load.image('string', 'assets/Symbol 100011.png');
    for (let i = 10001; i <= 10026; i++) {
        this.load.image(`letter-${i - 10000}`, `assets/Symbol ${i}.png`);
    }
}

function createPump(scene) {
    // Create the pump button and set its position
    const pumpScale = 0.6;
    const pumpX = window.innerWidth - 200;
    const pumpY = window.innerHeight - 220;

    pumpButton = scene.add.image(pumpX, pumpY, 'pump').setInteractive().setScale(pumpScale);
    pumpButton.setDepth(10);

    // Add click listener for the pump button
    pumpButton.on('pointerdown', () => {
        if (!balloon) {
            createBalloon(scene);
        } else {
            inflateBalloon(scene);
        }
    });
}

function createBalloon(scene) {
    // Create a balloon with random image and position
    const randomBalloon = Phaser.Math.Between(1, 10);
    balloon = scene.add.image(window.innerWidth - 360, window.innerHeight - 273, `balloon-${randomBalloon}`)
        .setScale(0.2)
        .setOrigin(0.5)
        .setInteractive();

    // Add random letter to the balloon
    const randomLetter = Phaser.Math.Between(1, 26);
    const letterImage = `letter-${randomLetter}`;
    letter = scene.add.image(balloon.x, balloon.y, letterImage)
        .setOrigin(0.5)
        .setScale(0.1);

    // Set initial balloon properties
    balloon.setAlpha(1);
    inflationCount = 0;

    // Add click listener to burst balloon
    balloon.on('pointerdown', burstBalloon);
}

function inflateBalloon(scene) {
    // Inflate the balloon by increasing its scale
    if (inflationCount < 3) {
        inflationCount++;
        balloon.setScale(balloon.scaleX + 0.1, balloon.scaleY + 0.1);
        letter.setScale(letter.scaleX + 0.06, letter.scaleY + 0.06);
        balloon.y -= 22;
        letter.y -= 22;

        if (inflationCount === 3) {
            releaseBalloon();
        }
    }
}

function update() {
    // Move balloon randomly if it's flying
    if (balloon && balloon.isFlying) {
        balloon.x += balloon.speedX;
        balloon.y += balloon.speedY;

        if (string) {
            string.x = balloon.x;
            string.y = balloon.y + 20;
        }
        if (letter) {
            letter.x = balloon.x;
            letter.y = balloon.y;
        }

        if (balloon.x < 0) {
            popBalloon();
            createBalloon(this);
        }
    }
}

function releaseBalloon() {
    // Attach string and make the balloon fly
    string = balloon.scene.add.image(balloon.x, balloon.y, 'string')
        .setOrigin(0.5, 0)
        .setScale(0.5);

    balloon.isFlying = true;

    const randomSpeedX = Phaser.Math.Between(-1, -2);
    const randomSpeedY = Phaser.Math.Between(-0.5, 0.5);

    balloon.speedX = randomSpeedX;
    balloon.speedY = randomSpeedY;
}

function popBalloon() {
    // Destroy the balloon and reset references
    if (balloon) {
        balloon.destroy();
        if (string) string.destroy();
        if (letter) letter.destroy();
    }
    inflationCount = 0;
    balloon = null;
    string = null;
}

function burstBalloon() {
    // Trigger burst effect and pop balloon
    burstEmitter.setPosition(balloon.x, balloon.y);
    burstEmitter.explode(50);

    if (balloon) {
        popBalloon();
    }
}

function resizeBackground(bg, scene) {
    // Resize background to fit the screen
    bg.setDisplaySize(scene.scale.width, scene.scale.height);
}

// Adjust background size when window is resized
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});
