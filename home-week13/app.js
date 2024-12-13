// 이벤트 관리 클래스
class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    on(message, listener) {
        if (!this.listeners[message]) {
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener);
    }

    emit(message, payload = null) {
        if (this.listeners[message]) {
            this.listeners[message].forEach((l) => l(message, payload));
        }
    }

    clear() {
        this.listeners = {};
    }
}

// 게임 오브젝트 기본 클래스
class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dead = false;
        this.type = "";
        this.width = 0;
        this.height = 0;
        this.img = undefined;
    }

    rectFromGameObject() {
        return {
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width,
        };
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}

// 적 클래스
class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = "Enemy";
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 5;
            } else {
                clearInterval(id);
            }
        }, 300);
    }
}

// 보스 클래스 (마지막 스테이지)
class Boss extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 150;
        this.height = 100;
        this.type = "Boss";
        this.hp = 20; // 보스 체력
        this.maxHp = 20;

        let attackId = setInterval(() => {
            if (this.dead) {
                clearInterval(attackId);
                return;
            }
            // 보스 레이저 발사
            gameObjects.push(new EnemyLaser(this.x + this.width / 2 - 4, this.y + this.height));
        }, 2000);
    }

    takeDamage(dmg) {
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.dead = true;
        }
    }
}

// 영웅 클래스
class Hero extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 99;
        this.height = 75;
        this.type = "Hero";
        this.cooldown = 0;
        this.leftSidekick = null;
        this.rightSidekick = null;
        this.life = 3;
        this.points = 0;
        this.isDamaged = false;
        this.damageTimeoutId = null;
        this.shieldCount = 0;
        this.meteorCooldown = 0; // 메테오 쿨다운 초기화

        // 초기 이미지 heroImg는 로딩 후 할당
    }

    decrementLife() {
        // 실드가 있으면 실드 감소, 없으면 라이프 감소
        if (this.shieldCount > 0) {
            this.shieldCount--;
        } else {
            this.life--;
            this.setDamageImage();
            if (this.life === 0) {
                this.dead = true;
            }
        }
    }

    incrementPoints() {
        this.points += 100;
    }

    fire() {
        if (this.canFire()) {
            gameObjects.push(new Laser(this.x + 45, this.y - 10));
            this.cooldown = 500;
            let id = setInterval(() => {
                if (this.cooldown > 0) {
                    this.cooldown -= 100;
                } else {
                    clearInterval(id);
                }
            }, 100);
        }
    }

    canFire() {
        return this.cooldown === 0;
    }

    // Hero 클래스의 useMeteor 메서드 부분
    useMeteor() {
        if (!this.canUseMeteor()) return;
        gameObjects.push(new Meteor(0, 0));
        this.meteorCooldown = 60000; // 쿨타임 20초로 증가
        let id = setInterval(() => {
            if (this.meteorCooldown > 0) {
                this.meteorCooldown -= 100;
            } else {
                clearInterval(id);
            }
        }, 100);
    }

    canUseMeteor() {
        return !this.meteorCooldown || this.meteorCooldown <= 0;
    }

    setDamageImage() {
        if (this.damageTimeoutId) {
            clearTimeout(this.damageTimeoutId);
        }
        this.isDamaged = true;
        this.img = heroDamageImg;
        this.damageTimeoutId = setTimeout(() => {
            this.isDamaged = false;
            this.img = heroImg; // 복구
        }, 500);
    }
}

// 보조 우주선 클래스
class Sidekick extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 50;
        this.height = 50;
        this.type = "Sidekick";
        this.img = heroImg;
        this.cooldown = 0;
    }

    followHero(hero, offsetX) {
        this.y = hero.y;
        this.x = hero.x + offsetX;
    }

    fire() {
        if (this.canFire()) {
            gameObjects.push(new Laser(this.x + this.width / 2 - 4, this.y - 10));
            this.cooldown = 500;
            let id = setInterval(() => {
                if (this.cooldown > 0) {
                    this.cooldown -= 100;
                } else {
                    clearInterval(id);
                }
            }, 100);
        }
    }

    canFire() {
        return this.cooldown === 0;
    }
}

// 레이저 클래스 (영웅 레이저)
class Laser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = "Laser";
        this.img = laserImg;
        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

// 적/보스 레이저 클래스
class EnemyLaser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = "EnemyLaser";
        this.img = laserImg;
        let id = setInterval(() => {
            if (this.y < canvas.height) {
                this.y += 15;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

// 폭발 클래스
class Explosion extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 50;
        this.height = 50;
        this.type = "Explosion";
        this.img = explosionImg;
        setTimeout(() => {
            this.dead = true;
        }, 500);
    }
}

// 실드 아이템 클래스
class ShieldItem extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 40;
        this.height = 40;
        this.type = "ShieldItem";
        this.img = shieldImg;
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 5;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 300);
    }
}

// 메테오 클래스
class Meteor extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = canvas.width;
        this.height = 100;
        this.type = "Meteor";
        this.img = meteorImg;
        this.y = -100;
        let id = setInterval(() => {
            if (this.y < canvas.height) {
                this.y += 20;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

// 메시지 상수
const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
    GAME_END_LOSS: "GAME_END_LOSS",
    GAME_END_WIN: "GAME_END_WIN",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
    KEY_EVENT_M: "KEY_EVENT_M",
    COLLISION_HERO_SHIELD: "COLLISION_HERO_SHIELD",
    COLLISION_ENEMY_HERO_MISSILE: "COLLISION_ENEMY_HERO_MISSILE",
    COLLISION_METEOR_ENEMY: "COLLISION_METEOR_ENEMY",
    COLLISION_METEOR_BOSS: "COLLISION_METEOR_BOSS",
};

let canvas, ctx;
let heroImg, enemyImg, laserImg, explosionImg, lifeImg;
let heroDamageImg, bossImg, shieldImg, meteorImg;
let gameObjects = [];
let hero;
let eventEmitter = new EventEmitter();
let gameLoopId;

let stage = 1;
let totalStages = 3;

function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
    });
}

function createEnemies() {
    if (stage < totalStages) {
        const MONSTER_TOTAL = 5;
        const MONSTER_WIDTH = MONSTER_TOTAL * 98;
        const START_X = (canvas.width - MONSTER_WIDTH) / 2;
        const STOP_X = START_X + MONSTER_WIDTH;
        for (let x = START_X; x < STOP_X; x += 98) {
            for (let y = 0; y < 50 * 5; y += 50) {
                const enemy = new Enemy(x, y);
                enemy.img = enemyImg;
                gameObjects.push(enemy);
            }
        }
    } else {
        // 마지막 스테이지 - 보스 등장
        const boss = new Boss(canvas.width / 2 - 75, 50);
        boss.img = bossImg;
        gameObjects.push(boss);
    }
}

function createHero() {
    hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
    hero.img = heroImg;
    gameObjects.push(hero);

    const leftSidekick = new Sidekick(hero.x - 60, hero.y);
    const rightSidekick = new Sidekick(hero.x + 120, hero.y);
    leftSidekick.img = heroImg;
    rightSidekick.img = heroImg;
    hero.leftSidekick = leftSidekick;
    hero.rightSidekick = rightSidekick;
    gameObjects.push(leftSidekick);
    gameObjects.push(rightSidekick);
}

function drawGameObjects(ctx) {
    gameObjects.forEach((go) => go.draw(ctx));
}

function updateGameObjects() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
    const lasers = gameObjects.filter((go) => go.type === "Laser" && !go.dead);
    const boss = gameObjects.find((go) => go.type === "Boss" && !go.dead);
    const enemyLasers = gameObjects.filter((go) => go.type === "EnemyLaser" && !go.dead);
    const shieldItems = gameObjects.filter((go) => go.type === "ShieldItem" && !go.dead);
    const meteors = gameObjects.filter((go) => go.type === "Meteor" && !go.dead);

    // 레이저-적 충돌
    lasers.forEach((l) => {
        enemies.forEach((m) => {
            if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                    first: l,
                    second: m,
                });
            }
        });
        // 레이저-보스 충돌
        if (boss && intersectRect(l.rectFromGameObject(), boss.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                first: l,
                second: boss,
            });
        }
    });

    // 영웅-적 충돌
    enemies.forEach(enemy => {
        if (intersectRect(hero.rectFromGameObject(), enemy.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
        }
    });
    // 영웅-보스 충돌
    if (boss && intersectRect(hero.rectFromGameObject(), boss.rectFromGameObject())) {
        eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy: boss });
    }

    // 영웅-실드 아이템 충돌
    shieldItems.forEach(shieldItem => {
        if (intersectRect(hero.rectFromGameObject(), shieldItem.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_HERO_SHIELD, { shieldItem });
        }
    });

    // EnemyLaser-영웅 충돌
    enemyLasers.forEach(el => {
        if (intersectRect(hero.rectFromGameObject(), el.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO_MISSILE, { el });
        }
    });

    // Meteor-적 / Meteor-보스 충돌
    meteors.forEach(meteor => {
        enemies.forEach(enemy => {
            if (!enemy.dead && intersectRect(meteor.rectFromGameObject(), enemy.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_METEOR_ENEMY, { enemy });
            }
        });
        if (boss && intersectRect(meteor.rectFromGameObject(), boss.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_METEOR_BOSS, { boss });
        }
    });

    // 보조 우주선 위치 업데이트
    if (hero.leftSidekick) {
        hero.leftSidekick.followHero(hero, -60);
    }
    if (hero.rightSidekick) {
        hero.rightSidekick.followHero(hero, 120);
    }

    // 제거된 객체 필터링
    gameObjects = gameObjects.filter((go) => !go.dead);
}

// 실드 아이템 드랍 함수 (30% 확률로 드랍)
function dropShieldItem(x, y) {
    if (Math.random() < 0.3) {
        const shieldItem = new ShieldItem(x, y);
        gameObjects.push(shieldItem);
    }
}

// 충돌 검사
function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}

function initGame() {
    gameObjects = [];
    createEnemies();
    createHero();

    eventEmitter.on(Messages.KEY_EVENT_UP, () => {
        hero.y -= 20;
    });
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
        hero.y += 20;
    });
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
        hero.x -= 20;
    });
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
        hero.x += 20;
    });
    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (hero.canFire()) {
            hero.fire();
        }
        if (hero.leftSidekick && hero.leftSidekick.canFire()) {
            hero.leftSidekick.fire();
        }
        if (hero.rightSidekick && hero.rightSidekick.canFire()) {
            hero.rightSidekick.fire();
        }
    });
    eventEmitter.on(Messages.KEY_EVENT_M, () => {
        hero.useMeteor();
    });

    // 충돌 처리
    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        const explosion = new Explosion(second.x + second.width / 2 - 25, second.y + second.height / 2 - 25);
        gameObjects.push(explosion);

        first.dead = true;
        if (second.type === "Enemy") {
            second.dead = true;
            hero.incrementPoints();
            dropShieldItem(second.x, second.y);
        } else if (second.type === "Boss") {
            second.takeDamage(1);
            hero.incrementPoints();
        }
        checkStageCompletion();
    });
    eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
        enemy.dead = true;
        hero.decrementLife();
        // 적 파괴 시 실드 아이템 드랍
        if (enemy.type === "Enemy") {
            dropShieldItem(enemy.x, enemy.y);
        }
        checkHeroAndStage();
    });

    eventEmitter.on(Messages.COLLISION_ENEMY_HERO_MISSILE, (_, { el }) => {
        el.dead = true;
        hero.decrementLife();
        checkHeroAndStage();
    });

    eventEmitter.on(Messages.COLLISION_HERO_SHIELD, (_, { shieldItem }) => {
        shieldItem.dead = true;
        hero.shieldCount += 1; // 실드 개수 증가
    });

    eventEmitter.on(Messages.COLLISION_METEOR_ENEMY, (_, { enemy }) => {
        enemy.dead = true;
        hero.incrementPoints();
        dropShieldItem(enemy.x, enemy.y);
        checkStageCompletion();
    });

    eventEmitter.on(Messages.COLLISION_METEOR_BOSS, (_, { boss }) => {
        boss.takeDamage(5);
        hero.incrementPoints();
        const explosion = new Explosion(boss.x + boss.width / 2 - 25, boss.y + boss.height / 2 - 25);
        gameObjects.push(explosion);
        checkStageCompletion();
    });

    eventEmitter.on(Messages.GAME_END_WIN, () => {
        endGame(true);
    });
    eventEmitter.on(Messages.GAME_END_LOSS, () => {
        endGame(false);
    });

    eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
        resetGame();
    });
}

function drawLife() {
    const START_POS = canvas.width - 180;
    for (let i = 0; i < hero.life; i++) {
        ctx.drawImage(
            lifeImg,
            START_POS + (45 * (i + 1)),
            canvas.height - 37
        );
    }
}

function drawPoints() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    drawText("Points: " + hero.points, 10, canvas.height - 20);
}

// 실드 개수 표시 함수
function drawShieldCount() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "blue";
    ctx.textAlign = "left";
    drawText("Shield: " + hero.shieldCount, 10, canvas.height - 60);
}

// 메테오 상태 표시 함수
function drawMeteorStatus() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "yellow";
    ctx.textAlign = "left";
    if (hero.canUseMeteor()) {
        drawText("Meteor Ready", 10, canvas.height - 100);
    } else {
        const cooldownSeconds = Math.ceil(hero.meteorCooldown / 1000);
        drawText("Meteor Cooldown: " + cooldownSeconds + "s", 10, canvas.height - 100);
    }
}

function drawStage() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    drawText("Stage: " + stage, 10, 40);
}

function drawBossHP(boss) {
    if (!boss) return;
    // HP 바 표시
    const barWidth = 200;
    const barHeight = 20;
    const x = (canvas.width - barWidth) / 2;
    const y = 60;
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, barWidth, barHeight);
    // 남은 HP 비율
    const hpRatio = boss.hp / boss.maxHp;
    ctx.fillStyle = "green";
    ctx.fillRect(x, y, barWidth * hpRatio, barHeight);

    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("BOSS HP", x + barWidth / 2, y - 5);
}

function drawText(message, x, y) {
    ctx.fillText(message, x, y);
}

function isHeroDead() {
    return hero.life <= 0;
}

function isEnemiesDead() {
    const enemies = gameObjects.filter((go) => (go.type === "Enemy" || go.type === "Boss") && !go.dead);
    return enemies.length === 0;
}

function checkStageCompletion() {
    if (isEnemiesDead() && !isHeroDead()) {
        if (stage < totalStages) {
            stage++;
            startNextStage();
        } else {
            eventEmitter.emit(Messages.GAME_END_WIN);
        }
    }
}

function checkHeroAndStage() {
    if (isHeroDead()) {
        eventEmitter.emit(Messages.GAME_END_LOSS);
        return;
    }
    if (isEnemiesDead()) {
        if (stage < totalStages) {
            stage++;
            startNextStage();
        } else {
            eventEmitter.emit(Messages.GAME_END_WIN);
        }
    }
}

function startNextStage() {
    clearInterval(gameLoopId);
    eventEmitter.clear();
    initGame();
    gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawPoints();
        drawShieldCount();
        drawMeteorStatus(); // 메테오 상태 표시
        drawLife();
        drawStage();
        updateGameObjects();
        drawGameObjects(ctx);
        const boss = gameObjects.find((go) => go.type === "Boss" && !go.dead);
        if (boss) {
            drawBossHP(boss);
        }
    }, 100);
}

function displayMessage(message, color = "red") {
    ctx.font = "30px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function endGame(win) {
    clearInterval(gameLoopId);
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (win) {
            displayMessage(
                "Victory!!! Pew Pew... - Press [Enter] to start a new game Captain Pew Pew",
                "green"
            );
        } else {
            displayMessage(
                "You died !!! Press [Enter] to start a new game Captain Pew Pew"
            );
        }
    }, 200)
}

function resetGame() {
    if (gameLoopId) {
        clearInterval(gameLoopId);
        eventEmitter.clear();
        stage = 1;
        initGame();
        gameLoopId = setInterval(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawPoints();
            drawShieldCount();
            drawMeteorStatus(); // 메테오 상태 표시
            drawLife();
            drawStage();
            updateGameObjects();
            drawGameObjects(ctx);
            const boss = gameObjects.find((go) => go.type === "Boss" && !go.dead);
            if (boss) {
                drawBossHP(boss);
            }
        }, 100);
    }
}

window.onload = async () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    heroImg = await loadTexture("assets/player.png");
    enemyImg = await loadTexture("assets/enemyShip.png");
    laserImg = await loadTexture("assets/laserRed.png");
    explosionImg = await loadTexture("assets/laserGreenShot.png");
    lifeImg = await loadTexture("assets/life.png");
    heroDamageImg = await loadTexture("assets/playerDamaged.png"); // 플레이어 데미지 이미지
    bossImg = await loadTexture("assets/enemyUFO.png"); // 보스 이미지
    shieldImg = await loadTexture("assets/shield.png"); // 실드 아이템 이미지
    meteorImg = await loadTexture("assets/meteorBig.png"); // 메테오 이미지

    initGame();

    gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGameObjects(ctx);
        updateGameObjects();
        drawPoints();
        drawShieldCount();
        drawMeteorStatus(); // 메테오 상태 표시
        drawLife();
        drawStage();
        const boss = gameObjects.find((go) => go.type === "Boss" && !go.dead);
        if (boss) {
            drawBossHP(boss);
        }
    }, 100);
};

window.addEventListener("keyup", (evt) => {
    if (evt.key === "ArrowUp") {
        eventEmitter.emit(Messages.KEY_EVENT_UP);
    } else if (evt.key === "ArrowDown") {
        eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    } else if (evt.key === "ArrowLeft") {
        eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    } else if (evt.key === "ArrowRight") {
        eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    } else if (evt.keyCode === 32) { // 스페이스바
        eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    } else if (evt.key === "Enter") {
        eventEmitter.emit(Messages.KEY_EVENT_ENTER);
    } else if (evt.key === "m" || evt.key === "M") {
        eventEmitter.emit(Messages.KEY_EVENT_M);
    }
});
