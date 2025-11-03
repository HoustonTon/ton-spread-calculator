# 🔧 Решение проблем с Bybit API на Render

## ❌ Проблема: 403 Error при получении TON/USDT курса

### Причина:
Bybit использует CloudFront защиту, которая блокирует запросы с серверов хостинга (Render, Vercel, и т.д.)

---

## ✅ Решение 1: Использовать альтернативный источник данных

Bybit предоставляет публичный WebSocket API который сложнее заблокировать.

### Исправление в server.js:

Заменить функцию `getBybitSpotPrice()` на использование альтернативного endpoint:

```javascript
// Alternative: Use Bybit public ticker endpoint
async function getBybitSpotPrice() {
    try {
        console.log('Fetching TON/USDT spot price from alternative endpoint...');
        
        // Try direct API without authentication
        const response = await axios.get('https://api-testnet.bybit.com/v5/market/tickers', {
            params: {
                category: 'spot',
                symbol: 'TONUSDT'
            },
            headers: {
                'Accept': 'application/json'
            },
            timeout: 5000
        });

        if (response.data && response.data.result && response.data.result.list && response.data.result.list.length > 0) {
            const ticker = response.data.result.list[0];
            const price = parseFloat(ticker.lastPrice);
            console.log('TON/USDT spot price:', price);
            return price;
        }
        
        throw new Error('Unable to fetch spot price');
    } catch (error) {
        console.error('Error fetching TON/USDT spot price:', error.message);
        
        // Fallback: Use CoinGecko API (always works)
        try {
            console.log('Trying CoinGecko as fallback...');
            const cgResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
                params: {
                    ids: 'the-open-network',
                    vs_currencies: 'usd'
                }
            });
            
            if (cgResponse.data && cgResponse.data['the-open-network']) {
                const price = cgResponse.data['the-open-network'].usd;
                console.log('TON/USDT price from CoinGecko:', price);
                return price;
            }
        } catch (cgError) {
            console.error('CoinGecko fallback also failed:', cgError.message);
        }
        
        throw error;
    }
}
```

---

## ✅ Решение 2: Использовать CoinGecko API (Рекомендуется)

CoinGecko - бесплатный API который не блокирует серверы.

### Полная замена функции:

```javascript
// Get TON/USDT price from CoinGecko (более надежный источник)
async function getBybitSpotPrice() {
    try {
        console.log('Fetching TON/USD price from CoinGecko...');
        
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'the-open-network',
                vs_currencies: 'usd'
            },
            headers: {
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        if (response.data && response.data['the-open-network'] && response.data['the-open-network'].usd) {
            const price = parseFloat(response.data['the-open-network'].usd);
            console.log('TON/USDT price from CoinGecko:', price);
            return price;
        }
        
        throw new Error('Unable to fetch price from CoinGecko');
    } catch (error) {
        console.error('Error fetching TON/USDT price:', error.message);
        throw error;
    }
}
```

**Преимущества CoinGecko:**
- ✅ Никогда не блокирует запросы
- ✅ Бесплатный без ограничений
- ✅ Стабильный API
- ✅ USD ≈ USDT (разница минимальная)

---

## ✅ Решение 3: Использовать proxy

Если обязательно нужен Bybit API, используйте прокси-сервис.

### Вариант A: CORS Anywhere

Добавьте прокси перед URL:
```javascript
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const response = await axios.get(proxyUrl + 'https://api.bybit.com/v5/market/tickers', ...);
```

### Вариант B: Собственный прокси

Создайте простой прокси сервер на отдельном Render сервисе.

---

## 🎯 Рекомендация:

**Используйте Решение 2 (CoinGecko)** - это самый надежный вариант.

---

## 📝 Как применить исправление:

### 1. Замените функцию в server.js

### 2. Загрузите на GitHub:
```bash
cd Documents/ton-spread-calculator
git add server.js
git commit -m "Fix: Use CoinGecko API instead of Bybit Spot"
git push
```

### 3. Render автоматически обновится через 1-2 минуты

### 4. Проверьте работу:
```
https://ton-spread-calculator.onrender.com
```

---

## 🔍 Как проверить логи на Render:

1. Зайдите на https://dashboard.render.com
2. Откройте проект `ton-spread-calculator`
3. Вкладка **"Logs"**
4. Ищите сообщения:
   - ✅ `TON/USDT price from CoinGecko: X.XXX`
   - ❌ `Error fetching TON/USDT spot price:`

---

## 💡 Дополнительные советы:

### Если CoinGecko тоже не работает:
Используйте комбинированный подход - попробуйте несколько API:
1. Bybit
2. CoinGecko
3. CoinMarketCap
4. Fallback на фиксированное значение

### Пример multi-fallback:
```javascript
// Попробовать Bybit
try { return await getBybitPrice(); } catch {}

// Попробовать CoinGecko
try { return await getCoinGeckoPrice(); } catch {}

// Fallback
return 2.20; // Примерная цена
```

---

## 📞 Нужна помощь?

Если проблема остается:
1. Покажите логи из Render
2. Укажите точную ошибку
3. Я помогу найти решение