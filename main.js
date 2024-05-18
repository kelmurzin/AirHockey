const puckPos = {
    x: 540,
    y: 1100
}

const boardConfig = {
    x: 45,
    y: 150,
    w: 990,
    h: 1620
}

const states = {
    play: 'play',
    goal: 'gaol',
    waitPlayer: 'waitPlayer'
}

let state = states.play

function ChangeState(_state) {
    state = _state
}

const playerPos = {
    x: 540,
    y: 1600,
}

const botPos = {
    x: 540,
    y: 250,
}

let score = {
    bot: 0,
    player: 0
}

class SceneA extends Phaser.Scene {
    constructor() {
        super({ key: 'sceneA' })
    }

    preload() {
        this.load.image('bg', 'assets/bg.png');
        this.load.image('ball', 'assets/ball.png');
        this.load.image('player', 'assets/player.png');
        this.load.spritesheet('part', 'assets/part.png', { frameWidth: 100, frameHeight: 100 })
    }

    create() {
        const bg = this.add.image(540, 960, 'bg')

        this.player = this.physics.add.image(playerPos.x, playerPos.y, 'player');
        this.player.setDirectControl();
        this.player.setCircle(70);

        this.bot = this.physics.add.image(botPos.x, botPos.y, 'player');
        this.bot.setCircle(70);

        this.puck = this.physics.add.image(puckPos.x, puckPos.y, 'ball',)
        this.puck.setBounce(1.5);
        this.puck.body.drag.x = 0.2
        this.puck.body.drag.y = 0.2
        this.puck.body.useDamping = true
        this.puck.setCircle(40);
        this.puck.setMaxVelocity(3000, 3000);
        this.puck.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.puck)

        this.physics.add.collider(this.bot, this.puck);

        const gatesBotRec = this.add.rectangle(540, 110, 250, 100, 0x6666ff, 0)
        this.gatesBot = this.physics.add.existing(gatesBotRec)
        this.gatesBot.name = 'bot'
        this.gatesBot.body.setImmovable(true)
        this.gatesBot.body.setAllowGravity(false);

        this.checkGoal(this.gatesBot)

        const gatesPlayerRec = this.add.rectangle(540, 1810, 250, 100, 0x6666ff, 0)
        this.gatesPlayer = this.physics.add.existing(gatesPlayerRec)
        this.gatesPlayer.name = 'player'
        this.gatesPlayer.body.setImmovable(true)
        this.gatesPlayer.body.setAllowGravity(false);

        this.checkGoal(this.gatesPlayer)

        const angle1 = this.add.rectangle(20, 1800, 150, 150, 0x6666ff, 0)
        this.angle1 = this.physics.add.existing(angle1)
        this.angle1.body.setImmovable(true)
        this.angle1.body.setAllowGravity(false);

        const angle2 = this.add.rectangle(20, 120, 150, 150, 0x6666ff, 0)
        this.angle2 = this.physics.add.existing(angle2)
        this.angle2.body.setImmovable(true)
        this.angle2.body.setAllowGravity(false);

        const angle3 = this.add.rectangle(1070, 120, 150, 150, 0x6666ff, 0)
        this.angle3 = this.physics.add.existing(angle3)
        this.angle3.body.setImmovable(true)
        this.angle3.body.setAllowGravity(false);

        const angle4 = this.add.rectangle(1070, 1800, 150, 150, 0x6666ff, 0)
        this.angle4 = this.physics.add.existing(angle4)
        this.angle4.body.setImmovable(true)
        this.angle4.body.setAllowGravity(false);

        this.physics.world.setBounds(boardConfig.x, boardConfig.y, boardConfig.w, boardConfig.h);

        this.scoreText = this.add.text(1020, 885, `${score.bot}\n${score.player}`, { fontFamily: 'Arial', fontSize: 70, color: 'black' }).setOrigin(1, 0)

        this.dragPlayer = false

        this.player.setInteractive();

        this.player.on('pointerdown', () => {
            if (state === states.waitPlayer) {
                ChangeState(states.play)
            }
            if (state != states.play)
                return
            this.dragPlayer = true
        });

        this.input.on('pointerdown', (pointer) => {
            this.pointerX = pointer.position.x
            this.pointerY = pointer.position.y
        });

        this.input.on('pointermove', pointer => {

            this.pointerX = pointer.position.x
            this.pointerY = pointer.position.y

            if (state != states.play)
                return

            if (this.dragPlayer) {
                if (pointer.position.x >= (boardConfig.x + boardConfig.w - this.player.body.radius)) {
                    this.pointerX = boardConfig.x + boardConfig.w - this.player.body.radius
                }
                if (pointer.position.x <= (boardConfig.x + this.player.body.radius)) {
                    this.pointerX = boardConfig.x + this.player.body.radius
                }
                if (pointer.position.y >= (boardConfig.h + boardConfig.y - this.player.body.radius)) {
                    this.pointerY = boardConfig.h + boardConfig.y - this.player.body.radius
                }
                if (pointer.position.y <= 960) {
                    this.pointerY = 960
                }
            }
        });

        this.input.on('pointerup', (pointer) => {
            this.dragPlayer = false
        })

        this.physics.world.fixedStep = false

        this.posX = 0
        this.posY = 0
    }

    checkGoal(_gates) {
        this.physics.add.collider(this.puck, _gates, function (puck, gates) {
            ChangeState(states.goal)
            this.puck.body.enable = false
            this.nextRound(gates.name)
        }.bind(this));
    }

    nextRound(gatesName) {
        this.dragPlayer = false

        let partPosY
        let partAMin
        let partAMax

        const posXMove = 540
        let posYMove
        switch (gatesName) {
            case 'bot':
                posYMove = 10
                partPosY = 150
                partAMin = 180
                partAMax = 0
                break;
            case 'player':
                posYMove = 1900
                partPosY = 1760
                partAMin = 0
                partAMax = -180
                break;
        }
        this.scoreUpdate(gatesName)

        const emitter = this.add.particles(0, 0, 'part', {
            frame: [0, 1, 2, 3, 4, 5, 6],
            lifespan: 500,
            speed: { min: 500, max: 1000 },
            angle: { min: partAMin, max: partAMax },
            scale: { start: 0.5, end: 0 },
            emitting: false,
        });
        emitter.emitParticleAt(540, partPosY, 200);

        const tween = this.tweens.add({
            targets: this.puck,
            x: posXMove,
            y: posYMove,
            ease: 'Power1',
            duration: 1000,
            onComplete: () => {
                this.resetBall()
                ChangeState(states.waitPlayer)
                this.resetBat(this.player.body, playerPos)
                this.resetBat(this.bot.body, botPos)
            },
        });
    }

    resetBall() {
        this.puck.body.reset(puckPos.x, puckPos.y)
        this.puck.body.enable = true
    }

    resetBat(_bat, _batPos) {
        _bat.reset(_batPos.x, _batPos.y)
    }

    scoreUpdate(name) {
        switch (name) {
            case 'bot':
                score.player += 10
                break;
            case 'player':
                score.bot += 10
                break;
        }
        this.scoreText.setText(`${score.bot}\n${score.player}`)
    }

    update() {

        this.physics.world.collide(this.puck, [this.angle1, this.angle2, this.angle3, this.angle4]);

        if (this.bot && this.puck) {
            if (this.pointerX && this.dragPlayer) {
                this.posX = Math.max(boardConfig.w / 2 + this.player.body.radius, this.pointerX) + this.player.body.radius;
                this.posX = Math.min(this.pointerX, this.posX);
                this.posY = Math.min(960, this.pointerY) - this.player.body.radius;
                this.posY = Math.max(this.pointerY, this.posY);
                this.player.setPosition(this.posX, this.posY)
            }
            this.playBot()
        }
    }

    playBot() {

        if (state === states.goal) {
            this.bot.body.stop()
            return
        }

        const distance = Phaser.Math.Distance.BetweenPoints(this.bot.body.center, botPos);

        if (this.puck.body.position.y < 960 && (this.puck.body.position.y > this.bot.body.position.y)) {
            this.physics.moveToObject(this.bot, this.puck, 2500);
        }
        else {
            if (distance < 50) {
                this.bot.body.reset(botPos.x, botPos.y);
            } else {
                this.physics.moveToObject(this.bot, botPos, 3000);
            }
        }
    }
}

let game
function StartGame() {

    const myCustomCanvas = document.createElement('canvas')
    myCustomCanvas.id = 'myCustomCanvas'
    document.body.appendChild(myCustomCanvas)

    const config = {
        type: Phaser.CANVAS,
        scene: SceneA,
        transparent: true,
        canvas: document.getElementById('myCustomCanvas'),
        physics: {
            default: 'arcade',
            arcade: { debug: false }
        },
        disableContextMenu: true,
        banner: false,
        width: window.innerWidth,
        height: window.innerHeight,
        virtualWidth: 1080,
        virtualHeight: 1920,
        orientation: "portrait",
    }

    game = new Phaser.Game(config)

    game.onResize = function () {
        let size;

        this.scale.resize(1080, 1920);
        this.scale.refresh();

        if (config.orientation == "landscape") {
            size = config.virtualWidth

        } else if (config.orientation == "portrait") {
            size = config.virtualHeight
        }

        if (window.innerWidth > window.innerHeight) {
            this.renderer.projectionWidth = size * window.innerWidth / window.innerHeight;
            this.renderer.projectionHeight = size;
        } else {
            this.renderer.projectionWidth = size;
            this.renderer.projectionHeight = size * window.innerHeight / window.innerWidth;
        }
    }
    window.addEventListener("resize", game.onResize.bind(game), false)
    game.onResize()
}
window.onload = function () {
    StartGame()
}