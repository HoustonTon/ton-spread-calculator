# 🛠️ Детальный план реализации

## Обзор изменений

Этот документ содержит пошаговую инструкцию для реализации всех требуемых изменений в калькуляторе TON спреда.

---

## 📦 Изменение 1: Backend - server.js

### 1.1 Функция `fetchBybitUSDTRubP2P()`

**Текущая реализация:**
```javascript
for (let page = 5; page <= 8; page++) {
    // парсинг страниц 5-8
}
```

**Новая реализация:**
```javascript
for (let page = 1; page <= 5; page++) {
    // парсинг страниц 1-5
}
```

**Файл:** `ton-spread-calculator/server.js`  
**Строка:** 23  
**Изменение:**
```javascript
// БЫЛО:
for (let page = 5; page <= 8; page++) {

// СТАЛО:
for (let page = 1; page <= 5; page++) {
```

**Также обновить:**
- Строка 20: сообщение лога
  ```javascript
  console.log('Fetching USDT/RUB P2P prices from Bybit pages 1-5...');
  ```

### 1.2 Улучшение ответа API `/api/prices`

**Текущий ответ:**
```json
{
  "success": true,
  "usdtRub": 80.50,
  "tonUsdt": 2.195,
  "p2pSuccess": true,
  "spotSuccess": true,
  "timestamp": "..."
}
```

**Добавить детали:**
```javascript
// В функции fetchBybitUSDTRubP2P() вернуть дополнительные поля:
return {
    averagePrice: averagePrice,
    priceCount: allPrices.length,
    minPrice: Math.min(...allPrices),
    maxPrice: Math.max(...allPrices),
    currency: 'RUB',
    pages: '1-5'  // добавить это поле
};
```

**В endpoint `/api/prices` добавить:**
```javascript
return res.json({
    success: true,
    usdtRub: usdtRubPrice,
    tonUsdt: tonUsdtPrice,
    p2pSuccess: p2pSuccess,
    spotSuccess: spotSuccess,
    timestamp: new Date().toISOString(),
    details: {  // новое поле
        usdtRub: {
            averagePrice: usdtRubPrice,
            priceCount: p2pData?.priceCount || 0,
            minPrice: p2pData?.minPrice || 0,
            maxPrice: p2pData?.maxPrice || 0,
            pages: '1-5'
        },
        tonUsdt: {
            lastPrice: tonUsdtPrice
        }
    }
});
```

---

## 🎨 Изменение 2: Frontend - index.html

### 2.1 Обновление входных полей

**Текущие поля (строки 207-215):**
```html
<div class="input-group">
    <label for="purchasePrice">Цена покупки TON (RUB):</label>
    <input type="number" id="purchasePrice" step="0.01" placeholder="Например: 500">
</div>

<div class="input-group">
    <label for="purchaseAmount">Сумма покупки (RUB):</label>
    <input type="number" id="purchaseAmount" step="0.01" placeholder="Например: 10000">
</div>
```

**Новые поля:**
```html
<div class="input-group">
    <label for="tonPriceRub">Цена покупки TON (RUB):</label>
    <input type="number" id="tonPriceRub" step="0.01" placeholder="Например: 175" min="0">
</div>

<div class="input-group">
    <label for="investmentAmount">Сумма инвестиции (RUB):</label>
    <input type="number" id="investmentAmount" step="0.01" placeholder="Например: 40000" min="0">
</div>
```

**Изменить ID полей:**
- `purchasePrice` → `tonPriceRub`
- `purchaseAmount` → `investmentAmount`

### 2.2 Обновление блока результатов

**Заменить весь блок результатов (строки 223-263) на:**

```html
<div class="results" id="results">
    <!-- Шаг 1: Покупка TON -->
    <div class="step-card">
        <div class="step-header">
            <span class="step-number">1</span>
            <span class="step-title">Покупка TON</span>
        </div>
        <div class="calculation-details">
            <div class="calc-line">
                <span id="step1-calc"></span>
            </div>
            <div class="calc-line fee">
                <span>Комиссия 0.9%:</span>
                <span id="step1-fee"></span>
            </div>
            <div class="calc-line result">
                <span>Итого TON:</span>
                <span id="step1-result" class="highlight"></span>
            </div>
        </div>
    </div>

    <!-- Шаг 2: Перевод на биржу -->
    <div class="step-card">
        <div class="step-header">
            <span class="step-number">2</span>
            <span class="step-title">Перевод TON на биржу</span>
        </div>
        <div class="calculation-details">
            <div class="calc-line">
                <span id="step2-calc"></span>
            </div>
            <div class="calc-line fee">
                <span>Комиссия перевода:</span>
                <span id="step2-fee">-0.05 TON</span>
            </div>
            <div class="calc-line result">
                <span>Итого TON:</span>
                <span id="step2-result" class="highlight"></span>
            </div>
        </div>
    </div>

    <!-- Шаг 3: Обмен TON → USDT -->
    <div class="step-card">
        <div class="step-header">
            <span class="step-number">3</span>
            <span class="step-title">Обмен TON → USDT</span>
        </div>
        <div class="calculation-details">
            <div class="calc-line">
                <span id="step3-calc"></span>
            </div>
            <div class="calc-line fee">
                <span>Комиссия обмена 0.18%:</span>
                <span id="step3-fee"></span>
            </div>
            <div class="calc-line result">
                <span>Итого USDT:</span>
                <span id="step3-result" class="highlight"></span>
            </div>
        </div>
    </div>

    <!-- Шаг 4: Продажа USDT → RUB -->
    <div class="step-card">
        <div class="step-header">
            <span class="step-number">4</span>
            <span class="step-title">Продажа USDT за RUB (P2P)</span>
        </div>
        <div class="calculation-details">
            <div class="calc-line">
                <span id="step4-calc"></span>
            </div>
            <div class="calc-line result">
                <span>Итого RUB:</span>
                <span id="step4-result" class="highlight"></span>
            </div>
        </div>
    </div>

    <!-- Итоговый результат -->
    <div class="final-result-card">
        <h3>💵 Итоговый результат</h3>
        <div class="final-details">
            <div class="final-line">
                <span>Начальная сумма:</span>
                <span id="initial-amount"></span>
            </div>
            <div class="final-line">
                <span>Итоговая сумма:</span>
                <span id="final-amount"></span>
            </div>
            <div class="final-line profit-line">
                <span>Прибыль:</span>
                <span id="profit-amount"></span>
            </div>
            <div class="final-line spread-line">
                <span>Спред:</span>
                <span id="spread-percent"></span>
            </div>
        </div>
        
        <!-- Визуализация спреда -->
        <div class="spread-visualization">
            <div class="spread-label">Спред:</div>
            <div class="spread-bar-container">
                <div id="spread-bar" class="spread-bar"></div>
                <div id="spread-bar-text" class="spread-bar-text"></div>
            </div>
        </div>
    </div>

    <!-- Детализация комиссий -->
    <div class="commission-details-card">
        <h3>💸 Детализация комиссий</h3>
        <div class="commission-line">
            <span>Покупка TON (0.9%):</span>
            <span id="comm-purchase"></span>
        </div>
        <div class="commission-line">
            <span>Перевод на биржу (0.05 TON):</span>
            <span id="comm-transfer"></span>
        </div>
        <div class="commission-line">
            <span>Обмен на бирже (0.18%):</span>
            <span id="comm-exchange"></span>
        </div>
        <div class="commission-line total">
            <span><strong>Всего комиссий:</strong></span>
            <span id="comm-total"></span>
        </div>
    </div>
</div>
```

### 2.3 Обновление JavaScript логики

**Заменить функцию `calculateSpread()` на:**

```javascript
async function calculateSpread() {
    const tonPriceRub = parseFloat(document.getElementById('tonPriceRub').value);
    const investmentAmount = parseFloat(document.getElementById('investmentAmount').value);
    const errorMessage = document.getElementById('errorMessage');
    const calculateBtn = document.getElementById('calculateBtn');

    // Reset error
    errorMessage.classList.remove('visible');
    errorMessage.textContent = '';

    // Validation
    if (isNaN(tonPriceRub) || tonPriceRub <= 0) {
        errorMessage.textContent = 'Пожалуйста, введите корректную цену покупки TON';
        errorMessage.classList.add('visible');
        return;
    }

    if (isNaN(investmentAmount) || investmentAmount <= 0) {
        errorMessage.textContent = 'Пожалуйста, введите корректную сумму инвестиции';
        errorMessage.classList.add('visible');
        return;
    }

    // Disable button and show loading
    calculateBtn.disabled = true;
    calculateBtn.innerHTML = '<span class="loader"></span>';

    try {
        // Fetch prices from Bybit
        const prices = await fetchPrices();
        
        if (!prices || !prices.usdtRub || !prices.tonUsdt) {
            throw new Error('Не удалось получить курсы валют');
        }

        const { usdtRub, tonUsdt } = prices;

        // ШАГИ РАСЧЕТА
        
        // Шаг 1: Покупка TON с комиссией 0.9%
        const tonBeforeFee = investmentAmount / tonPriceRub;
        const tonPurchaseFee = tonBeforeFee * 0.009;
        const tonAmount = tonBeforeFee - tonPurchaseFee;

        // Шаг 2: Перевод на биржу (-0.05 TON)
        const tonTransferFee = 0.05;
        const tonAfterTransfer = tonAmount - tonTransferFee;

        if (tonAfterTransfer <= 0) {
            throw new Error('Недостаточно TON после перевода на биржу. Увеличьте сумму инвестиции.');
        }

        // Шаг 3: Обмен TON → USDT
        const usdtBeforeFee = tonAfterTransfer * tonUsdt;
        const usdtExchangeFee = usdtBeforeFee * 0.0018;
        const usdtAfterFee = usdtBeforeFee - usdtExchangeFee;

        // Шаг 4: Продажа USDT → RUB
        const finalAmount = usdtAfterFee * usdtRub;

        // Шаг 5: Расчет прибыли и спреда
        const profit = finalAmount - investmentAmount;
        const spreadPercent = (profit / investmentAmount) * 100;

        // Расчет комиссий в RUB
        const commPurchaseRub = tonPurchaseFee * tonPriceRub;
        const commTransferRub = tonTransferFee * tonUsdt * usdtRub;
        const commExchangeRub = usdtExchangeFee * usdtRub;
        const commTotalRub = commPurchaseRub + commTransferRub + commExchangeRub;

        // ОТОБРАЖЕНИЕ РЕЗУЛЬТАТОВ

        // Шаг 1
        document.getElementById('step1-calc').textContent = 
            `${investmentAmount.toFixed(2)} RUB ÷ ${tonPriceRub.toFixed(2)} RUB/TON = ${tonBeforeFee.toFixed(4)} TON`;
        document.getElementById('step1-fee').textContent = 
            `-${tonPurchaseFee.toFixed(4)} TON (-${commPurchaseRub.toFixed(2)} RUB)`;
        document.getElementById('step1-result').textContent = 
            `${tonAmount.toFixed(4)} TON`;

        // Шаг 2
        document.getElementById('step2-calc').textContent = 
            `${tonAmount.toFixed(4)} TON`;
        document.getElementById('step2-result').textContent = 
            `${tonAfterTransfer.toFixed(4)} TON`;

        // Шаг 3
        document.getElementById('step3-calc').textContent = 
            `${tonAfterTransfer.toFixed(4)} TON × ${tonUsdt.toFixed(3)} USDT/TON = ${usdtBeforeFee.toFixed(2)} USDT`;
        document.getElementById('step3-fee').textContent = 
            `-${usdtExchangeFee.toFixed(4)} USDT (-${commExchangeRub.toFixed(2)} RUB)`;
        document.getElementById('step3-result').textContent = 
            `${usdtAfterFee.toFixed(2)} USDT`;

        // Шаг 4
        document.getElementById('step4-calc').textContent = 
            `${usdtAfterFee.toFixed(2)} USDT × ${usdtRub.toFixed(2)} RUB/USDT`;
        document.getElementById('step4-result').textContent = 
            `${finalAmount.toFixed(2)} RUB`;

        // Итоговый результат
        document.getElementById('initial-amount').textContent = 
            `${investmentAmount.toFixed(2)} RUB`;
        document.getElementById('final-amount').textContent = 
            `${finalAmount.toFixed(2)} RUB`;
        
        const profitElement = document.getElementById('profit-amount');
        profitElement.textContent = `${profit.toFixed(2)} RUB`;
        profitElement.className = profit >= 0 ? 'profit-positive' : 'profit-negative';
        
        const spreadElement = document.getElementById('spread-percent');
        spreadElement.textContent = `${spreadPercent.toFixed(2)}%`;
        spreadElement.className = profit >= 0 ? 'profit-positive' : 'profit-negative';

        // Визуализация спреда
        const spreadBar = document.getElementById('spread-bar');
        const spreadBarText = document.getElementById('spread-bar-text');
        const absSpreadPercent = Math.abs(spreadPercent);
        const barWidth = Math.min(absSpreadPercent * 10, 100); // масштаб
        
        spreadBar.style.width = barWidth + '%';
        spreadBar.className = 'spread-bar ' + (profit >= 0 ? 'positive' : 'negative');
        spreadBarText.textContent = spreadPercent.toFixed(2) + '%';

        // Детализация комиссий
        document.getElementById('comm-purchase').textContent = 
            `-${tonPurchaseFee.toFixed(4)} TON (-${commPurchaseRub.toFixed(2)} RUB)`;
        document.getElementById('comm-transfer').textContent = 
            `-${tonTransferFee.toFixed(2)} TON (-${commTransferRub.toFixed(2)} RUB)`;
        document.getElementById('comm-exchange').textContent = 
            `-${usdtExchangeFee.toFixed(4)} USDT (-${commExchangeRub.toFixed(2)} RUB)`;
        document.getElementById('comm-total').textContent = 
            `-${commTotalRub.toFixed(2)} RUB`;

        // Show results
        document.getElementById('results').classList.add('visible');

        // Notify Telegram
        if (tg.platform !== 'unknown') {
            const emoji = profit >= 0 ? '✅' : '❌';
            tg.showAlert(`${emoji} Расчет завершен!\nПрибыль: ${profit.toFixed(2)} RUB\nСпред: ${spreadPercent.toFixed(2)}%`);
        }

    } catch (error) {
        errorMessage.textContent = 'Ошибка: ' + error.message;
        errorMessage.classList.add('visible');
    } finally {
        // Re-enable button
        calculateBtn.disabled = false;
        calculateBtn.textContent = 'Рассчитать спред';
    }
}

// Update event listeners
document.getElementById('tonPriceRub').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') calculateSpread();
});

document.getElementById('investmentAmount').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') calculateSpread();
});
```

### 2.4 Добавление новых CSS стилей

**Добавить в секцию `<style>` (после строки 197):**

```css
/* Step cards */
.step-card {
    background: var(--tg-theme-bg-color, #ffffff);
    border: 1px solid var(--tg-theme-hint-color, #e0e0e0);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
}

.step-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.step-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--tg-theme-button-color, #0088cc);
    color: var(--tg-theme-button-text-color, #ffffff);
    border-radius: 50%;
    font-weight: 600;
    font-size: 14px;
    margin-right: 10px;
}

.step-title {
    font-weight: 600;
    font-size: 15px;
    color: var(--tg-theme-text-color, #000000);
}

.calculation-details {
    padding-left: 38px;
}

.calc-line {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 14px;
    color: var(--tg-theme-text-color, #000000);
}

.calc-line.fee {
    color: var(--tg-theme-hint-color, #999999);
    font-size: 13px;
}

.calc-line.result {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--tg-theme-hint-color, #e0e0e0);
    font-weight: 600;
}

.highlight {
    color: var(--tg-theme-button-color, #0088cc);
    font-weight: 600;
}

/* Final result card */
.final-result-card {
    background: linear-gradient(135deg, 
        var(--tg-theme-button-color, #0088cc) 0%, 
        var(--tg-theme-button-color, #0066aa) 100%);
    color: white;
    border-radius: 16px;
    padding: 20px;
    margin: 20px 0;
}

.final-result-card h3 {
    margin-bottom: 16px;
    font-size: 18px;
}

.final-details {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
}

.final-line {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 15px;
}

.final-line:last-child {
    margin-bottom: 0;
}

.profit-line,
.spread-line {
    font-size: 16px;
    font-weight: 600;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.profit-positive {
    color: #4CAF50;
}

.profit-negative {
    color: #F44336;
}

/* Spread visualization */
.spread-visualization {
    margin-top: 16px;
}

.spread-label {
    font-size: 13px;
    margin-bottom: 8px;
    opacity: 0.9;
}

.spread-bar-container {
    position: relative;
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    overflow: hidden;
}

.spread-bar {
    height: 100%;
    transition: width 0.5s ease, background-color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 12px;
    border-radius: 16px;
}

.spread-bar.positive {
    background: linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%);
}

.spread-bar.negative {
    background: linear-gradient(90deg, #F44336 0%, #EF5350 100%);
}

.spread-bar-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: 600;
    font-size: 14px;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Commission details card */
.commission-details-card {
    background: var(--tg-theme-secondary-bg-color, #f5f5f5);
    border-radius: 12px;
    padding: 16px;
    margin-top: 16px;
}

.commission-details-card h3 {
    font-size: 16px;
    margin-bottom: 12px;
    color: var(--tg-theme-text-color, #000000);
}

.commission-line {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
    color: var(--tg-theme-text-color, #000000);
}

.commission-line:last-child {
    margin-bottom: 0;
}

.commission-line.total {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 2px solid var(--tg-theme-hint-color, #e0e0e0);
    font-size: 15px;
    color: #F44336;
}
```

---

## 📝 Изменение 3: Обновление test-calculation.js

**Обновить тестовый скрипт с новыми входными данными:**

```javascript
// Test calculation with new logic
console.log('=== TON Spread Calculator Test (Updated) ===\n');

// Input data
const tonPriceRub = 175; // RUB per TON (user input)
const investmentAmount = 40000; // RUB (user investment)
const usdtRub = 80.5; // RUB per USDT (from P2P pages 1-5)
const tonUsdt = 2.195; // USDT per TON (from spot)

console.log('📥 Input:');
console.log(`  Цена покупки TON: ${tonPriceRub} RUB`);
console.log(`  Сумма инвестиции: ${investmentAmount} RUB`);
console.log(`  Курс USDT/RUB (P2P 1-5): ${usdtRub} RUB`);
console.log(`  Курс TON/USDT (spot): ${tonUsdt} USDT\n`);

// Step 1: Purchase TON with 0.9% commission
const tonBeforeFee = investmentAmount / tonPriceRub;
const tonPurchaseFee = tonBeforeFee * 0.009;
const tonAmount = tonBeforeFee - tonPurchaseFee;
console.log('1️⃣  Покупка TON:');
console.log(`  До комиссии: ${tonBeforeFee.toFixed(4)} TON`);
console.log(`  Комиссия 0.9%: -${tonPurchaseFee.toFixed(4)} TON`);
console.log(`  После комиссии: ${tonAmount.toFixed(4)} TON\n`);

// Step 2: Transfer to exchange (-0.05 TON)
const tonTransferFee = 0.05;
const tonAfterTransfer = tonAmount - tonTransferFee;
console.log('2️⃣  Перевод на биржу:');
console.log(`  До перевода: ${tonAmount.toFixed(4)} TON`);
console.log(`  Комиссия: -${tonTransferFee} TON`);
console.log(`  После перевода: ${tonAfterTransfer.toFixed(4)} TON\n`);

// Step 3: Exchange TON to USDT
const usdtBeforeFee = tonAfterTransfer * tonUsdt;
console.log('3️⃣  Обмен TON → USDT:');
console.log(`  TON: ${tonAfterTransfer.toFixed(4)}`);
console.log(`  Курс: ${tonUsdt} USDT/TON`);
console.log(`  USDT до комиссии: ${usdtBeforeFee.toFixed(4)} USDT\n`);

// Step 4: Exchange commission 0.18%
const usdtExchangeFee = usdtBeforeFee * 0.0018;
const usdtAfterFee = usdtBeforeFee - usdtExchangeFee;
console.log('4️⃣  Комиссия обмена 0.18%:');
console.log(`  До комиссии: ${usdtBeforeFee.toFixed(4)} USDT`);
console.log(`  Комиссия: -${usdtExchangeFee.toFixed(4)} USDT`);
console.log(`  После комиссии: ${usdtAfterFee.toFixed(4)} USDT\n`);

// Step 5: Sell USDT for RUB at P2P price
const finalAmount = usdtAfterFee * usdtRub;
console.log('5️⃣  Продажа USDT за RUB (P2P):');
console.log(`  USDT: ${usdtAfterFee.toFixed(4)}`);
console.log(`  Курс P2P: ${usdtRub} RUB/USDT`);
console.log(`  Итого RUB: ${finalAmount.toFixed(2)} RUB\n`);

// Step 6: Calculate profit and spread
const profit = finalAmount - investmentAmount;
const spreadPercent = (profit / investmentAmount) * 100;

// Calculate commissions in RUB
const commPurchaseRub = tonPurchaseFee * tonPriceRub;
const commTransferRub = tonTransferFee * tonUsdt * usdtRub;
const commExchangeRub = usdtExchangeFee * usdtRub;
const commTotalRub = commPurchaseRub + commTransferRub + commExchangeRub;

console.log('💰 Результат:');
console.log(`  Начальная сумма: ${investmentAmount.toFixed(2)} RUB`);
console.log(`  Итоговая сумма: ${finalAmount.toFixed(2)} RUB`);
console.log(`  Прибыль: ${profit.toFixed(2)} RUB`);
console.log(`  Процент спреда: ${spreadPercent.toFixed(2)}%\n`);

console.log('💸 Детализация комиссий:');
console.log(`  Покупка TON: -${commPurchaseRub.toFixed(2)} RUB`);
console.log(`  Перевод: -${commTransferRub.toFixed(2)} RUB`);
console.log(`  Обмен: -${commExchangeRub.toFixed(2)} RUB`);
console.log(`  Всего комиссий: -${commTotalRub.toFixed(2)} RUB\n`);

if (profit >= 0) {
    console.log('✅ Профитная сделка!');
} else {
    console.log('❌ Убыточная сделка');
}

console.log('\n=== End of Test ===');
```

---

## 📚 Изменение 4: Обновление документации

### 4.1 README.md

**Обновить разделы:**

1. Строка 8: Изменить описание покупки TON
2. Строки 15-20: Обновить параметры
3. Строки 156-164: Обновить инструкции по использованию

### 4.2 USAGE.md

**Обновить:**

1. Строки 14-18: Новые входные данные
2. Строки 20-52: Обновить пример расчета

### 4.3 QUICKSTART.md

**Обновить:**

1. Строки 43-52: Новые инструкции по использованию
2. Строки 62-74: Новый пример расчета

---

## ✅ Чек-лист реализации

### Backend:
- [ ] Изменить цикл парсинга со страниц 5-8 на 1-5
- [ ] Обновить логи консоли
- [ ] Добавить поле `pages` в возвращаемые данные
- [ ] Улучшить структуру ответа API с полем `details`

### Frontend:
- [ ] Обновить ID и labels входных полей
- [ ] Создать новую структуру HTML для результатов
- [ ] Переписать функцию `calculateSpread()`
- [ ] Добавить новые CSS стили для step-cards
- [ ] Добавить стили для визуализации спреда
- [ ] Добавить стили для блока комиссий
- [ ] Обновить event listeners для новых полей

### Тестирование:
- [ ] Обновить test-calculation.js
- [ ] Протестировать с данными из примера
- [ ] Проверить корректность всех расчетов
- [ ] Проверить отображение в браузере
- [ ] Проверить в Telegram Mini App

### Документация:
- [ ] Обновить README.md
- [ ] Обновить USAGE.md
- [ ] Обновить QUICKSTART.md
- [ ] Создать ARCHITECTURE.md ✅
- [ ] Создать IMPLEMENTATION_PLAN.md ✅

---

## 🎯 Ожидаемый результат

После реализации всех изменений приложение должно:

1. ✅ Принимать цену TON в RUB и сумму инвестиции в RUB
2. ✅ Парсить USDT/RUB с Bybit P2P страниц 1-5
3. ✅ Получать TON/USDT spot цену с Bybit
4. ✅ Показывать пошаговый расчет всей операции
5. ✅ Отображать визуализацию спреда
6. ✅ Детализировать все комиссии
7. ✅ Использовать цветовую индикацию прибыли/убытка
8. ✅ Работать в браузере и Telegram Mini App

---

## 🚀 Следующие шаги

После утверждения плана переключитесь в **Code mode** для реализации всех изменений.