const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');
const launches = new Map();

// let latestFlightNumber = 100; 

const DEFAULT_FLIGHT_NUMBER = 100;

function existLaunchWithId(launchId) {
    return launches.has(launchId);
}

async function getLatestFlightNumber(){
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber');

    if(!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch;
}

const launch = {
    flightNumber: 100,
    mission: 'Kepler Xploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Keplar-442 b',
    customers: ['ZTM', 'NASA'],
    upcoming: true,
    success: true
};

saveLaunch(launch)

async function getAllLaunches() {
    return await launchesDatabase
    .find({},{ '_id': 0, '__v': 0 }) 
}

async function saveLaunch(launch){

    const planet = await planets.findOne({
        keplerName: launch.target
    });

    if (!planet) {
        // throw new Error('No matching planet found');
    }

    await launchesDatabase.updateOne({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true
    });
}

async function scheduleNewLaunch(launch){

    const newFlightNumber = await getLatestFlightNumber();

    const newLaunch = Object.assign(launch, {
        flightNumber: newFlightNumber.flightNumber+1,
        customers: ['ZTM', 'NASA'],
        upcoming: true,
        success: true,
    });

    await saveLaunch(newLaunch);
}

function abortLaunchById(lauchId) {
    const aborted = launches.get(lauchId);
    aborted.upcoming = false;
    aborted.success = false;
    return aborted;
}

module.exports = {
    existLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById
}