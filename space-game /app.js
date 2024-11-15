function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);

        };

    })
}

window.onload = async () => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    // 별 패턴 생성용 이미지 로드
    const starBg = await loadTexture('assets/starBackground.png');

    // 별 패턴 생성
    const starPattern = ctx.createPattern(starBg, 'repeat');

    // 별 패턴으로 캔버스 채우기
    ctx.fillStyle = starPattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 메인 플레이어 우주선 이미지 로드
    const heroImg = await loadTexture('assets/player.png');
    const enemyImg = await loadTexture('assets/enemyShip.png');

    // 메인 플레이어 우주선 그리기
    const heroX = canvas.width / 2 - 45; // 중앙 배치
    const heroY = canvas.height - canvas.height / 4;
    ctx.drawImage(heroImg, heroX, heroY);

    // 보조 우주선 크기 조정 및 그리기
    const sideShipWidth = heroImg.width * 0.5; // 크기 조정 (50%)
    const sideShipHeight = heroImg.height * 0.5;

    // 보조 우주선 왼쪽
    ctx.drawImage(
        heroImg,
        heroX - sideShipWidth - 20, // 메인 우주선 왼쪽
        heroY + sideShipHeight, // 약간 아래 배치
        sideShipWidth,
        sideShipHeight
    );

    // 보조 우주선 오른쪽
    ctx.drawImage(
        heroImg,
        heroX + heroImg.width + 20, // 메인 우주선 오른쪽
        heroY + sideShipHeight, // 약간 아래 배치
        sideShipWidth,
        sideShipHeight
    );

    // 적 우주선 생성
    createEnemies2(ctx, canvas, enemyImg);
};



function createEnemies(ctx, canvas, enemyImg) {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * enemyImg.width;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;
    for (let x = START_X; x < STOP_X; x += enemyImg.width) {
        for (let y = 0; y < enemyImg.height * 5; y += enemyImg.height) {
            ctx.drawImage(enemyImg, x, y);

        }
    }
}

function createEnemies2(ctx, canvas, enemyImg) {
    const ROWS = 5; // 피라미드의 높이 (행 수)
    const START_Y = 0; // 적군 우주선의 시작 Y 좌표 (0으로 설정해 가장 위부터 시작)
    const VERTICAL_SPACING = enemyImg.height; // 행 간 간격을 고정

    for (let row = 0; row < ROWS; row++) {
        const numInRow = ROWS - row; // 각 행에 배치될 적군 우주선의 개수
        const rowWidth = numInRow * enemyImg.width; // 행의 전체 너비
        const startX = (canvas.width - rowWidth) / 2; // 행의 시작 X 좌표 (중앙 정렬)

        for (let i = 0; i < numInRow; i++) {
            const x = startX + i * enemyImg.width; // 각 적군 우주선의 X 좌표
            const y = START_Y + row * VERTICAL_SPACING; // 각 행의 Y 좌표
            ctx.drawImage(enemyImg, x, y);
        }
    }
}


