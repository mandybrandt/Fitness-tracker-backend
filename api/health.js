const express = require("express");
const healthRouter = express.Router();

healthRouter.use(async (req, res, next) => {
    console.log("A request is being made to /health");

    next();
});

healthRouter.get("/", (req, res)=> {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: new Date().toString()
    }

    try {
        res.send(healthcheck);
    } catch(error) {
        console.log(error);
    }
})

module.export = healthRouter;