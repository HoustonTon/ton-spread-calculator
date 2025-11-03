const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for Telegram Web App
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Function to fetch Bybit P2P USDT/RUB average price from page 5
async function fetchBybitUSDTRubP2P() {
    try {
        // Array to store all prices from page 5
        const allPrices = [];
        
        console.log('Fetching USDT/RUB P2P prices from Bybit page 5...');
        
        // Fetch only page 5
        const page = 5;
        try {
            // Using correct Bybit P2P API v3
            const response = await axios.post('https://api2.bybit.com/fiat/otc/item/online', {
                userId: '',
                tokenId: 'USDT',
                currencyId: 'RUB',
                payment: [],
                side: '1', // 1 = sell (продавцы USDT)
                size: '10',
                page: page.toString(),
                amount: '',
                authMaker: false,
                canTrade: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            console.log(`Page ${page} response status:`, response.status);

            if (response.data && response.data.result && response.data.result.items) {
                const items = response.data.result.items;
                console.log(`Found ${items.length} items on page ${page}`);
                
                items.forEach(item => {
                    if (item.price) {
                        const price = parseFloat(item.price);
                        allPrices.push(price);
                        console.log(`Price: ${price} RUB/USDT`);
                    }
                });
            } else {
                console.log(`No items found on page ${page}`);
            }
        } catch (pageError) {
            console.error(`Error fetching page ${page}:`, pageError.message);
            if (pageError.response) {
                console.error('Response data:', pageError.response.data);
            }
        }

        if (allPrices.length === 0) {
            console.error('No USDT/RUB prices found from P2P');
            throw new Error('No USDT/RUB prices found');
        }

        // Calculate average price from page 5
        const averagePrice = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
        
        console.log(`Successfully fetched ${allPrices.length} prices from page 5. Average: ${averagePrice} RUB/USDT`);
        
        return {
            averagePrice: averagePrice,
            priceCount: allPrices.length,
            minPrice: Math.min(...allPrices),
            maxPrice: Math.max(...allPrices),
            currency: 'RUB',
            pages: '5'
        };
        
    } catch (error) {
        console.error('Error fetching Bybit USDT/RUB P2P data:', error.message);
        throw error;
    }
}

// Get TON/USDT spot price from Bybit
async function getBybitSpotPrice() {
    try {
        console.log('Fetching TON/USDT spot price...');
        
        const response = await axios.get('https://api.bybit.com/v5/market/tickers', {
            params: {
                category: 'spot',
                symbol: 'TONUSDT'
            },
            headers: {
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Origin': 'https://www.bybit.com',
                'Referer': 'https://www.bybit.com/',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site'
            },
            timeout: 10000
        });

        console.log('Spot API response status:', response.status);

        if (response.data && response.data.result && response.data.result.list && response.data.result.list.length > 0) {
            const ticker = response.data.result.list[0];
            const price = parseFloat(ticker.lastPrice);
            console.log('TON/USDT spot price:', price);
            return price;
        }
        
        console.error('Invalid spot price response structure');
        throw new Error('Unable to fetch spot price');
    } catch (error) {
        console.error('Error fetching TON/USDT spot price:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
}

// API endpoint to get USDT/RUB P2P price and TON/USDT spot price
app.get('/api/prices', async (req, res) => {
    try {
        console.log('API /api/prices called');
        
        // Get USDT/RUB P2P price
        let usdtRubPrice;
        let p2pSuccess = false;
        let p2pData = null;
        try {
            p2pData = await fetchBybitUSDTRubP2P();
            usdtRubPrice = p2pData.averagePrice;
            p2pSuccess = true;
            console.log('P2P price fetched successfully:', usdtRubPrice);
        } catch (p2pError) {
            console.log('USDT/RUB P2P fetch failed, using fallback:', p2pError.message);
            usdtRubPrice = 100; // Fallback value
        }

        // Get TON/USDT spot price
        let tonUsdtPrice;
        let spotSuccess = false;
        try {
            tonUsdtPrice = await getBybitSpotPrice();
            spotSuccess = true;
            console.log('Spot price fetched successfully:', tonUsdtPrice);
        } catch (spotError) {
            console.log('TON/USDT spot fetch failed, using fallback:', spotError.message);
            tonUsdtPrice = 5.5; // Fallback value
        }

        return res.json({
            success: true,
            usdtRub: usdtRubPrice,
            tonUsdt: tonUsdtPrice,
            p2pSuccess: p2pSuccess,
            spotSuccess: spotSuccess,
            timestamp: new Date().toISOString(),
            details: {
                usdtRub: p2pData ? {
                    averagePrice: p2pData.averagePrice,
                    priceCount: p2pData.priceCount,
                    minPrice: p2pData.minPrice,
                    maxPrice: p2pData.maxPrice,
                    pages: p2pData.pages
                } : null,
                tonUsdt: {
                    lastPrice: tonUsdtPrice
                }
            }
        });
    } catch (error) {
        console.error('Error in /api/prices:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to fetch price data',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 TON Spread Calculator server running on port ${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   - GET /api/ton-price - Get current TON selling price`);
    console.log(`   - GET /api/health - Health check`);
});

module.exports = app;