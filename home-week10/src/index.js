// 무료 환율 API와 CoinGecko API URL 설정
const exchangeRateApiUrl = 'https://api.exchangerate-api.com/v4/latest/USD';
const cryptoApiUrl = 'https://api.coingecko.com/api/v3/simple/price';

const currencySelector = document.getElementById('currency-selector');
const cryptoSelector = document.getElementById('crypto-selector');
const exchangeRateElement = document.getElementById('exchange-rate');
const cryptoPriceElement = document.getElementById('crypto-price');
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const conversionResult = document.getElementById('conversion-result');

// 환율을 가져오는 함수
async function fetchExchangeRate(currency) {
    try {
        const response = await fetch(exchangeRateApiUrl);
        const data = await response.json();

        // 기본 통화는 USD이므로 KRW 환율로 조정
        const usdToKrwRate = data.rates['KRW'];
        const selectedCurrencyRate = data.rates[currency];
        const rateInKrw = usdToKrwRate / selectedCurrencyRate;

        animatePrice(exchangeRateElement, rateInKrw);
    } catch (error) {
        exchangeRateElement.textContent = '환율 로드 실패';
        console.error('Error fetching exchange rate:', error);
    }
}

// 암호화폐 가격을 가져오는 함수
async function fetchCryptoPrice(crypto) {
    try {
        const response = await fetch(`${cryptoApiUrl}?ids=${crypto}&vs_currencies=krw`);
        const data = await response.json();

        if (data[crypto] && data[crypto].krw !== undefined) {
            const rate = data[crypto].krw;
            animatePrice(cryptoPriceElement, rate);
        } else {
            throw new Error('암호화폐 데이터를 가져올 수 없습니다.');
        }
    } catch (error) {
        cryptoPriceElement.textContent = '암호화폐 가격 로드 실패';
        console.error('Error fetching cryptocurrency price:', error);
    }
}

// 가격 변화에 따른 애니메이션 함수
function animatePrice(element, newValue) {
    const oldValue = parseFloat(element.textContent.replace(/[^\d.-]/g, '')) || 0;
    element.textContent = newValue ? `${newValue.toFixed(2)} 원` : 'N/A';

    element.classList.remove('up', 'down');
    if (newValue > oldValue) element.classList.add('up');
    else if (newValue < oldValue) element.classList.add('down');
}

// 환율 계산 함수
async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (isNaN(amount) || amount <= 0) {
        conversionResult.textContent = "유효한 금액을 입력하세요.";
        return;
    }

    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
        const data = await response.json();
        const rate = data.rates[to];
        const convertedAmount = amount * rate;
        conversionResult.textContent = `${amount} ${from} = ${convertedAmount.toFixed(2)} ${to}`;
    } catch (error) {
        conversionResult.textContent = '환율 계산 실패';
        console.error('Error converting currency:', error);
    }
}

// 이벤트 리스너 설정
currencySelector.addEventListener('change', () => fetchExchangeRate(currencySelector.value));
cryptoSelector.addEventListener('change', () => fetchCryptoPrice(cryptoSelector.value));
document.getElementById('convert-button').addEventListener('click', convertCurrency);

// 초기 데이터 불러오기
fetchExchangeRate(currencySelector.value);
fetchCryptoPrice(cryptoSelector.value);


