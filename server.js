const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000; // Render обычно использует порты 10000+

// Enable CORS for Telegram Web App
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('.'));

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

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

// Get TON/USDT price with hosting-friendly sources (no geo-blocking)
async function getBybitSpotPrice() {
    try {
        console.log('Fetching TON/USDT price from hosting-friendly sources...');
        
        // Try KuCoin API (usually allows hosting requests)
        try {
            console.log('Trying KuCoin API (primary source)...');
            const kucoinResponse = await axios.get('https://api.kucoin.com/api/v1/market/orderbook/level1', {
                params: {
                    symbol: 'TON-USDT'
                },
                headers: {
                    'Accept': 'application/json'
                },
                timeout: 8000
            });

            if (kucoinResponse.data && kucoinResponse.data.data && kucoinResponse.data.data.price) {
                const price = parseFloat(kucoinResponse.data.data.price);
                console.log('TON/USDT price from KuCoin:', price);
                return price;
            }
        } catch (kucoinError) {
            console.log('KuCoin API failed:', kucoinError.message);
        }

        // Try OKX API
        try {
            console.log('Trying OKX API (fallback)...');
            const okxResponse = await axios.get('https://www.okx.com/api/v5/market/ticker', {
                params: {
                    instId: 'TON-USDT'
                },
                headers: {
                    'Accept': 'application/json'
                },
                timeout: 8000
            });

            if (okxResponse.data && okxResponse.data.data && okxResponse.data.data.length > 0) {
                const price = parseFloat(okxResponse.data.data[0].last);
                console.log('TON/USDT price from OKX:', price);
                return price;
            }
        } catch (okxError) {
            console.log('OKX API failed:', okxError.message);
        }

        // Try Gate.io API
        try {
            console.log('Trying Gate.io API (additional fallback)...');
            const gateResponse = await axios.get('https://api.gateio.ws/api/v4/spot/tickers', {
                params: {
                    currency_pair: 'TON_USDT'
                },
                headers: {
                    'Accept': 'application/json'
                },
                timeout: 8000
            });

            if (gateResponse.data && gateResponse.data.length > 0) {
                const price = parseFloat(gateResponse.data[0].last);
                console.log('TON/USDT price from Gate.io:', price);
                return price;
            }
        } catch (gateError) {
            console.log('Gate.io API failed:', gateError.message);
        }

        // Try Bitget API
        try {
            console.log('Trying Bitget API (final fallback)...');
            const bitgetResponse = await axios.get('https://api.bitget.com/api/spot/v1/market/ticker', {
                params: {
                    symbol: 'TONUSDT'
                },
                headers: {
                    'Accept': 'application/json'
                },
                timeout: 8000
            });

            if (bitgetResponse.data && bitgetResponse.data.data && bitgetResponse.data.data.lastPr) {
                const price = parseFloat(bitgetResponse.data.data.lastPr);
                console.log('TON/USDT price from Bitget:', price);
                return price;
            }
        } catch (bitgetError) {
            console.log('Bitget API failed:', bitgetError.message);
        }
        
        // If all APIs fail, throw error
        throw new Error('All hosting-friendly price sources failed (KuCoin, OKX, Gate.io, Bitget)');
        
    } catch (error) {
        console.error('Error fetching TON/USDT price from all sources:', error.message);
        throw error;
    }
}

// API endpoint to get USDT/RUB P2P price and TON/USDT spot price
app.get('/api/prices', async (req, res) => {
    const startTime = Date.now();
    console.log('🚀 API /api/prices called at', new Date().toISOString());
    
    try {
        // Get USDT/RUB P2P price
        let usdtRubPrice;
        let p2pSuccess = false;
        let p2pData = null;
        let p2pSource = 'fallback';
        
        try {
            console.log('📊 Fetching USDT/RUB P2P price from Bybit...');
            p2pData = await fetchBybitUSDTRubP2P();
            usdtRubPrice = p2pData.averagePrice;
            p2pSuccess = true;
            p2pSource = 'bybit-p2p';
            console.log('✅ P2P price fetched successfully:', usdtRubPrice, 'RUB/USDT');
        } catch (p2pError) {
            console.warn('⚠️ USDT/RUB P2P fetch failed:', p2pError.message);
            usdtRubPrice = 100; // Fallback value
            p2pSource = 'fallback';
        }

        // Get TON/USDT spot price
        let tonUsdtPrice;
        let spotSuccess = false;
        let spotSource = 'fallback';
        
        try {
            console.log('📈 Fetching TON/USDT spot price...');
            tonUsdtPrice = await getBybitSpotPrice();
            spotSuccess = true;
            spotSource = 'api-fallback-chain';
            console.log('✅ Spot price fetched successfully:', tonUsdtPrice, 'USDT');
        } catch (spotError) {
            console.warn('⚠️ TON/USDT spot fetch failed:', spotError.message);
            tonUsdtPrice = 5.5; // Fallback value
            spotSource = 'fallback';
        }

        const responseTime = Date.now() - startTime;
        console.log(`⏱️ API response time: ${responseTime}ms`);

        const response = {
            success: true,
            usdtRub: usdtRubPrice,
            tonUsdt: tonUsdtPrice,
            p2pSuccess: p2pSuccess,
            spotSuccess: spotSuccess,
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`,
            sources: {
                usdtRub: p2pSource,
                tonUsdt: spotSource
            },
            details: {
                usdtRub: p2pData ? {
                    averagePrice: p2pData.averagePrice,
                    priceCount: p2pData.priceCount,
                    minPrice: p2pData.minPrice,
                    maxPrice: p2pData.maxPrice,
                    pages: p2pData.pages,
                    source: p2pSource
                } : {
                    averagePrice: usdtRubPrice,
                    source: p2pSource,
                    note: 'Fallback value used'
                },
                tonUsdt: {
                    lastPrice: tonUsdtPrice,
                    source: spotSource,
                    note: spotSuccess ? 'Real data from API chain' : 'Fallback value used'
                }
            }
        };

        console.log('📤 Sending response:', {
            success: response.success,
            usdtRub: response.usdtRub,
            tonUsdt: response.tonUsdt,
            sources: response.sources
        });

        return res.json(response);
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Error in /api/prices:', error.message);
        console.error('📊 Stack trace:', error.stack);
        
        res.status(500).json({
            success: false,
            error: 'Unable to fetch price data',
            message: error.message,
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TON Spread Calculator server running on port ${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   - GET /api/prices - Get current prices`);
    console.log(`   - GET /api/health - Health check`);
    console.log(`🌐 Server accessible at http://localhost:${PORT}`);
});

// Error handling for server startup
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

module.exports = app;