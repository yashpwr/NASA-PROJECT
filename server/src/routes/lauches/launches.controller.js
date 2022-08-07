const { 
    getAllLaunches,
    scheduleNewLaunch,
    existLaunchWithId,    
    abortLaunchById
} = require('../../models/lauches.model');

const { getPagination } = require('../../services/query')

async function httpGetAllLaunches(req, res) {
    const { skip, limit } = getPagination(req.query);
    return res.status(200).json(
        await getAllLaunches(skip, limit)
        );
}

async function httpAddNewLaunch(req, res) {
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

    await scheduleNewLaunch(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {

    const lauchId = Number(req.params.id);
    const existsLaunch = await existLaunchWithId(lauchId);

    // if launch does't exist 
    if (!existsLaunch) {
        return res.status(404).json({
            error: 'Launch not found',
        });
    }
    
    //if launch does exists
    const aborted = await abortLaunchById(lauchId);
    if(!aborted){
        return res.status(400).json({
            error: 'Launch not aborted',
        });
    }
    return res.status(200).json({
        ok: true
    });
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
}