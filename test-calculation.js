// Test calculation with new logic (прибыль в USDT)
console.log('=== TON Spread Calculator Test (Прибыль в USDT) ===\n');

// Input data
const tonPriceRub = 175; // RUB per TON (user input)
const investmentAmount = 40000; // RUB (user investment)
const usdtRub = 81.9; // RUB per USDT (from P2P page 5 average)
const tonUsdt = 2.195; // USDT per TON (from spot)

console.log('📥 Input:');
console.log(`  Цена покупки TON: ${tonPriceRub} RUB`);
console.log(`  Сумма инвестиции: ${investmentAmount} RUB`);
console.log(`  Курс USDT/RUB (P2P страница 5): ${usdtRub} RUB`);
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
const usdtExchangeFee = usdtBeforeFee * 0.0018;
const usdtAfterFee = usdtBeforeFee - usdtExchangeFee;
console.log('3️⃣  Обмен TON → USDT:');
console.log(`  TON: ${tonAfterTransfer.toFixed(4)}`);
console.log(`  Курс: ${tonUsdt} USDT/TON`);
console.log(`  USDT до комиссии: ${usdtBeforeFee.toFixed(4)} USDT`);
console.log(`  Комиссия 0.18%: -${usdtExchangeFee.toFixed(4)} USDT`);
console.log(`  После комиссии: ${usdtAfterFee.toFixed(4)} USDT\n`);

// Step 4: Direct USDT purchase via P2P
const usdtDirectPurchase = investmentAmount / usdtRub;
console.log('4️⃣  Прямая покупка USDT на P2P (для сравнения):');
console.log(`  Сумма: ${investmentAmount} RUB`);
console.log(`  Курс P2P: ${usdtRub} RUB/USDT`);
console.log(`  Можно купить: ${usdtDirectPurchase.toFixed(4)} USDT\n`);

// Step 5: Calculate profit and spread in USDT
const profitUsdt = usdtAfterFee - usdtDirectPurchase;
const spreadPercent = (profitUsdt / usdtDirectPurchase) * 100;

// Calculate commissions in USDT
const commPurchaseTon = tonPurchaseFee;
const commTransferTon = tonTransferFee;
const commExchangeUsdt = usdtExchangeFee;
const commTotalUsdt = (commPurchaseTon + commTransferTon) * tonUsdt + commExchangeUsdt;

console.log('💰 Результат:');
console.log(`  Через P2P: ${usdtDirectPurchase.toFixed(4)} USDT`);
console.log(`  Через TON: ${usdtAfterFee.toFixed(4)} USDT`);
console.log(`  Прибыль: ${profitUsdt.toFixed(4)} USDT`);
console.log(`  Процент спреда: ${spreadPercent.toFixed(2)}%\n`);

console.log('💸 Детализация комиссий:');
console.log(`  Покупка TON: -${commPurchaseTon.toFixed(4)} TON`);
console.log(`  Перевод: -${commTransferTon.toFixed(2)} TON`);
console.log(`  Обмен: -${commExchangeUsdt.toFixed(4)} USDT`);
console.log(`  Всего комиссий: -${commTotalUsdt.toFixed(4)} USDT\n`);

if (profitUsdt >= 0) {
    console.log('✅ Профитная сделка!');
} else {
    console.log('❌ Убыточная сделка');
}

console.log('\n=== End of Test ===');