const launches = new Map();

let latestFlightNumber = 100;

function existLaunchWithId(launchId) {
    return launches.has(launchId);
}

const launch = {
    flightNumber: 100,
    mission: 'Kepler Xploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Keplar-442 b',
    customer: ['ZTM', 'NASA'],
    upcoming: true,
    success: true
};

launches.set(launch.flightNumber, launch);

function getAllLaunches() {
    return Array.from(launches.values());
}

function addNewLaunch(launch) {
    latestFlightNumber++;
    launches.set(
        latestFlightNumber, 
        Object.assign(launch,{
            flightNumber: latestFlightNumber,
            customers: ['ZTM', 'NASA'],
            upcoming: true,
            success: true,
        })
    );
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
    addNewLaunch,
    abortLaunchById
}