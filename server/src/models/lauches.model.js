const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 99;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches(){

    console.log('Downloading launch data...');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
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

    if (response.status !== 200) {
        console.log('Problem Downloading launch data');
        throw new Error('launch data download failed')
    }

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

        // console.log(`${launch.flightNumber} ${launch.mission}`);
        await saveLaunch(launch)


    }

}

async function loadLaunchData(){

    const firstLaunch = await findLaunch({
        flightNumber: 1,
        mission: 'FalconSat',
        rocket: 'Falcon 1',
    });

    if(firstLaunch){
        console.log('Launch data is already loaded');
    }else{
        await populateLaunches();
    }
}

async function findLaunch(filter){
    return await launchesDatabase.findOne(filter)
}

async function existLaunchWithId(launchId) {
    return await findLaunch({flightNumber: launchId});
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