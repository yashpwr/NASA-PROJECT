const http = require('http');
const app = require('./app');
require('dotenv').config();
const { mongoConnect } = require('./services/mongo')
const { loadPlanetata } = require('./models/planets.model')
const { loadLaunchData } = require('./models/lauches.model')

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
    await mongoConnect();
    await loadPlanetata();
    await loadLaunchData();
}

server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}...`);
})

startServer();