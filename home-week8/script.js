const quotes = [
    'When you have eliminated the impossible, whatever remains, howeverimprobable, must be the truth.', 'There is nothing more deceptive than an obvious fact.',
    'I ought to know by this time that when a fact appears to be opposed to along train of deductions it invariably proves to be capable of bearing someother interpretation.',
    'I never make exceptions. An exception disproves the rule.',
    'What one man can invent another can discover.',
    'Nothing clears up a case so much as stating it to another person.',
    'Education never ends, Watson. It is a series of lessons, with the greatestfor the last.',
];

let words = [];
let wordIndex = 0;
let startTime = Date.now();

const quoteElement = document.getElementById('quote');
const messageElement = document.getElementById('message');
const typedValueElement = document.getElementById('typed-value');
const startButton = document.getElementById('start');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalButton = document.getElementById('close-modal');

// 모달 창 열기 함수
function openModal(message) {
    modalMessage.innerText = message;
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';
}

// 모달 창 닫기 함수
function closeModal() {
    modal.style.display = 'none';
    modalOverlay.style.display = 'none';
}


document.getElementById('start').addEventListener('click', () => {
    startButton.disabled = true; // 게임 시작 시 버튼 비활성화
    const quoteIndex = Math.floor(Math.random() * quotes.length); // 무작위 인덱스 생성
    const quote = quotes[quoteIndex]; // 무작위 인덱스 값으로 인용문 선택
    words = quote.split(' '); // 공백 문자를 기준으로 words 배열에 저장
    wordIndex = 0; // 초기화
    const spanWords = words.map(function (word) { return `<span>${word} </span>` });
    // span 태그로 감싼 후 배열에 저장
    quoteElement.innerHTML = spanWords.join(''); // 하나의 문자열로 결합 및 설정
    quoteElement.childNodes[0].className = 'highlight'; // 첫번째 단어 강조
    messageElement.innerText = ''; // 메시지 요소 초기화
    typedValueElement.value = ''; //입력 필드 초기화
    typedValueElement.focus(); // 포커스 설정
    startTime = new Date().getTime(); // 타이핑 시작 시간 기록
    typedValueElement.disabled = false; // 입력 필드 활성화
    typedValueElement.removeEventListener('input', handleInput); // 리스너 삭제
    typedValueElement.addEventListener('input', handleInput); // 리스너 추가 
});

typedValueElement.addEventListener('input', () => {
    const currentWord = words[wordIndex]; // 현재 타이핑할 단어를 currentWord에 저장
    const typedValue = typedValueElement.value; // 입력한 값을 typedValue에 저장
    if (typedValue === currentWord && wordIndex === words.length - 1) { // 마지막 단어까지 정확히 입력했는 지 체크
        const elapsedTime = new Date().getTime() - startTime; // 타이핑에 소요된 시간 계산
        const seconds = (elapsedTime / 1000).toFixed(2);

        // 최고 점수 저장 및 표시
        const bestScore = parseFloat(localStorage.getItem('bestScore')); // 문자열을 숫자로 변환
        if (!bestScore || seconds < bestScore) {
            localStorage.setItem('bestScore', seconds);
            openModal(`CONGRATULATIONS!\nYou finished in ${seconds} seconds.\nNew High Score!`);
        } else {
            openModal(`CONGRATULATIONS!\nYou finished in ${seconds} seconds.\nBest Score: ${bestScore} seconds.`);
        }


        typedValueElement.disabled = true; // 입력 필드 비활성화
        startButton.disabled = false; // 게임 종료 시 버튼 활성화
        typedValueElement.removeEventListener('input', handleInput);
    } else if (typedValue.endsWith(' ') && typedValue.trim() === currentWord) { // 입력된 값이 공백으로 끝났는지와공백을 제거한 값이 현재 단어와 일치하는 지 확인
        typedValueElement.value = ''; // 입력 필드 초기화하여 다음 단어 입력 준비
        wordIndex++; // 다음 단어로 이동
        for (const wordElement of quoteElement.childNodes) { // 모든 강조 표시 제거
            wordElement.className = ''; // 클래스 제거
        }
        quoteElement.childNodes[wordIndex].className = 'highlight'; // 다음으로 타이핑할 단어에 클래스 추가
    } else if (currentWord.startsWith(typedValue)) { //현재 단어의 일부를 맞게 입력하고 있는 지 확인
        typedValueElement.className = ''; // 올바르면 클래스 제거

    } else {
        typedValueElement.className = 'error'; // 틀리면 error 클래스 추가
    }

    // 모달 창 닫기 버튼 및 오버레이 클릭 시 모달 창 닫기
    closeModalButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // 입력 필드에 타이핑 효과 추가
    document.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", () => {
            input.classList.add("typing-effect");

            // 일정 시간 후에 클래스 제거
            setTimeout(() => {
                input.classList.remove("typing-effect");
            }, 300); // 300ms 동안 효과 유지
        });
    });

});

