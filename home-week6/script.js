// console.log(document.getElementById('plant1'));
// dragElement(document.getElementById('plant1'));
// dragElement(document.getElementById('plant2'));
// dragElement(document.getElementById('plant3'));
// dragElement(document.getElementById('plant4'));
// dragElement(document.getElementById('plant5'));
// dragElement(document.getElementById('plant6'));
// dragElement(document.getElementById('plant7'));
// dragElement(document.getElementById('plant8'));
// dragElement(document.getElementById('plant9'));
// dragElement(document.getElementById('plant10'));
// dragElement(document.getElementById('plant11'));
// dragElement(document.getElementById('plant12'));
// dragElement(document.getElementById('plant13'));
// dragElement(document.getElementById('plant14'));

// function displayCandy() {
//     let candy = ['jellybeans'];
//     function addCandy(candyType) {
//         candy.push(candyType)
//     }
//     addCandy('gumdrops');
// }
// displayCandy();
// console.log(candy);


// function dragElement(terrariumElement) {
//     let highestZIndex = 1;
//     let pos1 = 0,
//         pos2 = 0,
//         pos3 = 0,
//         pos4 = 0;
//     terrariumElement.onpointerdown = pointerDrag;
//     terrariumElement.ondblclick = bringToFront;

//     function pointerDrag(e) {
//         e.preventDefault();
//         console.log(e);
//         pos3 = e.clientX;
//         pos4 = e.clientY;
//         document.onpointermove = elementDrag;
//         document.onpointerup = stopElementDrag;
//     }

//     function elementDrag(e) {
//         pos1 = pos3 - e.clientX;
//         pos2 = pos4 - e.clientY;
//         pos3 = e.clientX;
//         pos4 = e.clientY;
//         console.log(pos1, pos2, pos3, pos4);
//         terrariumElement.style.top = terrariumElement.offsetTop - pos2 + 'px';
//         terrariumElement.style.left = terrariumElement.offsetLeft - pos1 + 'px';
//     }

//     function stopElementDrag() {
//         document.onpointerup = null;
//         document.onpointermove = null;
//     }

//     function bringToFront() {
//         highestZIndex++;
//         terrariumElement.style.zIndex = highestZIndex;

//     }


// }
// 6주차 과제 
function displayCandy() {
    let candy = ['jellybeans'];
    function addCandy(candyType) {
        candy.push(candyType);
    }
    addCandy('gumdrops');
}
displayCandy();

// 위에 있는 기존 코드 Drag and Drop API 활용해서 수정 
// 요소를 드래그 가능하도록 설정
document.querySelectorAll('.plant').forEach(plant => {
    dragElement(plant);
});

function dragElement(terrariumElement) {
    let highestZIndex = 1;
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    terrariumElement.setAttribute('draggable', true);

    // 요소가 드래그를 시작할 때 이벤트
    terrariumElement.addEventListener('dragstart', pointerDrag);

    // 요소가 드래그 도중에 이동하는 동안의 이벤트
    terrariumElement.addEventListener('drag', elementDrag);

    // 요소가 드래그를 종료할 때 이벤트
    terrariumElement.addEventListener('dragend', stopElementDrag);

    // 요소가 더블 클릭될 때, z-index를 증가시켜 맨 앞으로 가져오는 기능
    terrariumElement.addEventListener('dblclick', bringToFront);

    function pointerDrag(e) {
        // 초기 위치 설정
        pos3 = e.clientX;
        pos4 = e.clientY;
    }

    function elementDrag(e) {
        if (e.clientX === 0 && e.clientY === 0) return; // 드래그 중단 시 무시

        // 드래그 중인 동안 요소 위치를 업데이트
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        terrariumElement.style.position = 'absolute';
        terrariumElement.style.top = (terrariumElement.offsetTop - pos2) + 'px';
        terrariumElement.style.left = (terrariumElement.offsetLeft - pos1) + 'px';

    }

    function stopElementDrag(e) {
        console.log(e);
        // 드래그가 끝난 후 이벤트를 해제하지 않아도 됨
    }

    function bringToFront() {
        highestZIndex++;
        terrariumElement.style.zIndex = highestZIndex;
    }
}


