const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 99;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function loadLaunchData(){
    console.log('Downloading launch data...');

    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }   
                }
            ]
        }
    });

    const launchDocs = response.data.docs;

    for(const launchDoc of launchDocs){

        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers']
        }) 

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'], 
            customers
        };

        console.log(`${launch.flightNumber} ${launch.mission}`);
    }
}

async function existLaunchWithId(launchId) {
    return await launchesDatabase.findOne({flightNumber: launchId});
}

async function getLatestFlightNumber(){
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber');

    if(!latestLaunch){
        return {flightNumber: DEFAULT_FLIGHT_NUMBER};
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

async function getAllLaunches() {
    return await launchesDatabase
    .find({},{ '_id': 0, '__v': 0 }) 
}

async function saveLaunch(launch){

    const planet = await planets.findOne({
        keplerName: launch.target
    });

    /*if (!planet) {
        // throw new Error('No matching planet found');
    }*/

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

async function abortLaunchById(lauchId) {
   const aborted = await launchesDatabase.updateOne({
        flightNumber: lauchId,
    }, {
        upcoming: false,
        success: false,
    });

    return aborted.modifiedCount === 1;
}

module.exports = {
    loadLaunchData,
    existLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById
}