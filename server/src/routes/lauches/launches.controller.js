const { 
    getAllLaunches,
    addNewLaunch,
    existLaunchWithId,    
    abortLaunchById
} = require('../../models/lauches.model');

async function httpGetAllLaunches(req, res) {
    return res.status(200).json(await getAllLaunches());
}

function httpAddNewLaunch(req, res) {
    const launch = req.body;

    if(!launch.mission || !launch.rocket || !launch.target || !launch.launchDate){
        return res.status(400).json({
            error: "Missing required lauch property"
        });    
    }

    launch.launchDate = new Date(launch.launchDate);
    if(isNaN(launch.launchDate)){
        return res.status(400).json({
            error: "Invalid lauch date"
        });    
    }

    addNewLaunch(launch);
    return res.status(201).json(launch);
}

function httpAbortLaunch(req, res) {
    const lauchId = Number(req.params.id);

    // if launch does't exist 
    if (!existLaunchWithId(lauchId)) {
        return res.status(404).json({
            error: 'Launch not found',
        });
    }
    
    //if launch does exists
    const aborted = abortLaunchById(lauchId);
    return res.status(200).json(aborted);
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
}