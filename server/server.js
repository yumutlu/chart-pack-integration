const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;

// Yahoo Finance API endpoint
const YAHOO_FINANCE_API = "https://query1.finance.yahoo.com/v8/finance/chart/";

// Örnek hisse senetleri
const stocks = ["AAPL", "GOOGL", "MSFT", "AMZN"];

// Hisse senedi verilerini alma fonksiyonu
async function getStockData(symbol) {
  try {
    const response = await axios.get(`${YAHOO_FINANCE_API}${symbol}`);
    const data = response.data.chart.result[0];
    return {
      symbol,
      price: data.meta.regularMarketPrice || null,
      change: data.meta.regularMarketChangePercent || null,
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return {
      symbol,
      price: null,
      change: null,
    };
  }
}

// WebSocket bağlantısı
io.on("connection", (socket) => {
  console.log("New client connected");

  // Her 5 saniyede bir veri gönder
  const interval = setInterval(async () => {
    try {
      const stocksData = await Promise.all(stocks.map(getStockData));
      socket.emit("stockUpdate", stocksData);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      socket.emit("error", "Failed to fetch stock data");
    }
  }, 5000);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
