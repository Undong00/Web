let cardOne = 7;
let cardTwo = 5;
let sum = cardOne + cardTwo;

let cardOneBank = 7;
let cardTwoBank = 5;
let cardThreeBank = 6;
let cardFourBank = 4;

let cardThree = 7;

sum += cardThree;

console.log(`You have ${sum} points`);

let bankSum = cardOneBank + cardTwoBank;

if (sum > 21) {
    console.log('Bust! You lose.');
}

else if (sum === 21) {
    console.log('Blackjack! You win.');
}
else {
    if (bankSum < 17) {
        bankSum += cardThreeBank;
    }

    console.log(`Bank has ${bankSum} points`);

    if (bankSum > 21) {
        console.log('Bank busts! You win.');
    }

    else if (sum === bankSum) {
        console.log('draw.');
    }
    else if (sum > bankSum && sum <= 21) {
        console.log('You win');
    }
    else {
        console.log('Bank wins');
    }
}
