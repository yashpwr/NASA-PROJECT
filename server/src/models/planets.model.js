const fs = require('fs');
const path  = require('path');
const { parse } = require('csv-parse');

const planets = require('./planets.mongo');

// const HabitablePlanets = [];

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] = 'CONFIRMED' && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 && planet['koi_prad'] < 1.6 && planet['kepler_name'] !== '';
}

function loadPlanetata() {
    return new Promise((resolve, reject) => { 
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'keplar_data.csv'))
        .pipe(parse({
            comment: '#',
            columns: true,
        }))
        .on('data', async (data) => {
            if(isHabitablePlanet(data)){
                // HabitablePlanets.push(data);
                savePlanet(data)
            }
        })
        .on('error', (err) => {
            console.log(err);
            reject(err);
        })
        .on('end', async () => {
            const countPlanetsFound = await getAllPlanets();
            console.log(`${countPlanetsFound.length} habitable planets found`)
            resolve()
        });
    });
}

async function getAllPlanets() {
    // return HabitablePlanets;
    return await planets.find({}, {
        '__v': 0,
        '_id': 0
    });
}

async function savePlanet(planet) {
    try {
        await planets.updateOne({
            keplerName: planet.kepler_name
        }, {
            keplerName: planet.kepler_name
        }, {
            upsert: true
        });        
    } catch (error) {
        console.error(`Could not save planet ${error}`)        
    }

}

module.exports = {
    loadPlanetata,
    getAllPlanets
}