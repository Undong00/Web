// 이벤트 관리 클래스: 특정 메시지에 대해 리스너 등록 및 호출을 관리합니다.
class EventEmitter {
    constructor() {
        this.listeners = {}; // 메시지별 리스너 목록 저장
    }

    // 특정 메시지에 대한 리스너 등록
    on(message, listener) {
        if (!this.listeners[message]) {
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener);
    }

    // 특정 메시지와 관련된 리스너 호출
    emit(message, payload = null) {
        if (this.listeners[message]) {
            this.listeners[message].forEach((l) => l(message, payload));
        }
    }
}

// 게임 오브젝트 클래스: 모든 게임 오브젝트의 공통 속성 및 동작 정의
class GameObject {
    constructor(x, y) {
        this.x = x; // x 좌표
        this.y = y; // y 좌표
        this.dead = false; // 파괴 여부
        this.type = ""; // 오브젝트 타입
        this.width = 0; // 폭
        this.height = 0; // 높이
        this.img = undefined; // 이미지 객체
    }

    // 오브젝트의 충돌 영역 계산
    rectFromGameObject() {
        return {
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width,
        };
    }

    // 오브젝트를 캔버스에 그리기
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}

// 적 클래스: 적 오브젝트의 동작 정의
class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98; // 적의 폭
        this.height = 50; // 적의 높이
        this.type = "Enemy"; // 오브젝트 타입 설정
        let id = setInterval(() => {
            // 적이 아래로 이동
            if (this.y < canvas.height - this.height) {
                this.y += 5;
            } else {
                clearInterval(id); // 화면 밖으로 나가면 이동 종료
            }
        }, 300); // 300ms마다 이동
    }
}

// 영웅 클래스: 플레이어 오브젝트 정의
class Hero extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 99;
        this.height = 75;
        this.type = "Hero";
        this.cooldown = 0; // 발사 쿨다운 초기화
        this.leftSidekick = null; // 왼쪽 보조 우주선
        this.rightSidekick = null; // 오른쪽 보조 우주선
    }

    // 레이저 발사
    fire() {
        if (this.canFire()) {
            gameObjects.push(new Laser(this.x + 45, this.y - 10)); // 레이저 추가
            this.cooldown = 500; // 쿨다운 설정
            let id = setInterval(() => {
                if (this.cooldown > 0) {
                    this.cooldown -= 100; // 쿨다운 감소
                } else {
                    clearInterval(id); // 쿨다운 완료 시 타이머 종료
                }
            }, 100);
        }
    }

    // 레이저 발사 가능 여부 확인
    canFire() {
        return this.cooldown === 0;
    }
}

// 보조 우주선 클래스: 영웅을 따라다니며 보조 역할 수행
class Sidekick extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 50;
        this.height = 50;
        this.type = "Sidekick";
        this.img = heroImg;
        this.cooldown = 0; // 발사 쿨다운 초기화
    }

    // 영웅을 따라다니며 위치 동기화
    followHero(hero, offsetX) {
        this.y = hero.y; // y 좌표는 영웅과 동일
        this.x = hero.x + offsetX; // x 좌표는 일정 간격 유지
    }

    // 레이저 발사
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

    // 레이저 발사 가능 여부 확인
    canFire() {
        return this.cooldown === 0;
    }
}

// 레이저 클래스: 발사체 오브젝트 정의
class Laser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = "Laser";
        this.img = laserImg;

        // 레이저가 위로 이동
        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15;
            } else {
                this.dead = true; // 화면 밖으로 나가면 제거
                clearInterval(id);
            }
        }, 100);
    }
}

// 폭발 클래스: 충돌 시 폭발 애니메이션 표시
class Explosion extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 50;
        this.height = 50;
        this.type = "Explosion";
        this.img = explosionImg;

        // 폭발 애니메이션 일정 시간 후 제거
        setTimeout(() => {
            this.dead = true;
        }, 500);
    }
}

// 메시지 상수 정의
const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
};

// 전역 변수
let canvas, ctx;
let heroImg, enemyImg, laserImg, explosionImg;
let gameObjects = [];
let hero;
let eventEmitter = new EventEmitter();

// 이미지 로드 함수
function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
    });
}

// 적 생성 함수
function createEnemies() {
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
}

// 영웅 생성 함수
function createHero() {
    hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
    hero.img = heroImg;
    gameObjects.push(hero);

    // 보조 우주선 추가
    const leftSidekick = new Sidekick(hero.x - 60, hero.y);
    const rightSidekick = new Sidekick(hero.x + 120, hero.y);
    leftSidekick.img = heroImg;
    rightSidekick.img = heroImg;
    hero.leftSidekick = leftSidekick;
    hero.rightSidekick = rightSidekick;
    gameObjects.push(leftSidekick);
    gameObjects.push(rightSidekick);
}

// 게임 오브젝트 그리기
function drawGameObjects(ctx) {
    gameObjects.forEach((go) => go.draw(ctx));
}

// 게임 오브젝트 업데이트
function updateGameObjects() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy");
    const lasers = gameObjects.filter((go) => go.type === "Laser");

    // 레이저와 적 충돌 검사
    lasers.forEach((l) => {
        enemies.forEach((m) => {
            if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                    first: l,
                    second: m,
                });
            }
        });
    });

    // 보조 우주선 위치 동기화
    if (hero.leftSidekick) {
        hero.leftSidekick.followHero(hero, -60);
    }
    if (hero.rightSidekick) {
        hero.rightSidekick.followHero(hero, 120);
    }

    // 제거된 객체 필터링
    gameObjects = gameObjects.filter((go) => !go.dead);
}

// 충돌 영역 확인 함수
function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}

// 게임 초기화
function initGame() {
    gameObjects = [];
    createEnemies();
    createHero();

    // 키 입력 이벤트 등록
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

    // 충돌 처리
    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        // 충돌 시 폭발 생성
        const explosion = new Explosion(second.x + second.width / 2 - 25, second.y + second.height / 2 - 25);
        gameObjects.push(explosion);

        // 충돌된 레이저와 적 제거
        first.dead = true;
        second.dead = true;
    });
}

// 윈도우 로드 이벤트
window.onload = async () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    // 이미지 로드
    heroImg = await loadTexture("assets/player.png");
    enemyImg = await loadTexture("assets/enemyShip.png");
    laserImg = await loadTexture("assets/laserRed.png");
    explosionImg = await loadTexture("assets/laserGreenShot.png");

    initGame();

    // 게임 루프
    let gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 화면 초기화
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height); // 배경 그리기
        drawGameObjects(ctx); // 게임 오브젝트 그리기
        updateGameObjects(); // 게임 오브젝트 업데이트
    }, 100);
};

// 키보드 입력 이벤트 등록
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
    }
});
