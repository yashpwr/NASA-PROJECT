const fs = require('fs');
const path  = require('path');
const { parse } = require('csv-parse');

const HabitablePlanets = [];

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
        .on('data', (data) => {
            if(isHabitablePlanet(data)){
                HabitablePlanets.push(data);
            }
        })
        .on('error', (err) => {
            console.log(err);
            reject(err);
        })
        .on('end', () => {
            resolve()
        });
    });
}

function getAllPlanets() {
    return HabitablePlanets;
}

module.exports = {
    loadPlanetata,
    getAllPlanets
}