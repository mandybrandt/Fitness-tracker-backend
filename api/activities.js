const express = require("express");
const activitiesRouter = express.Router();
// const utilities = require("utilities");
const { requireUser } = require("./utilities");
const { createActivity, updateActivity, getAllActivities, getPublicRoutinesByActivity } = require("../db");

// GET /api/activities/:activityId/routines
activitiesRouter.use((req, res, next) => {
  console.log("A request has been made to /activities");

  next();
})

activitiesRouter.get("/", async (req, res, next) => {
  try {
    const activities = await getAllActivities();
    if (activities) {
      res.send(activities);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/activities
activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
  const { activityId } = req.params;
  try {
    const activities = await getPublicRoutinesByActivity({ activityId });

    if (activities) {
      res.send(activities);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
})
// POST /api/activities
activitiesRouter.post('/', async (req, res, next) => {
  const { name, description } = req.body;
  const activityData = { name, description }

  try {
    const activityPost = await createActivity(activityData);
    if (activityPost) {
      res.send(activityPost);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

// PATCH /api/activities/:activityId
activitiesRouter.patch('/:activityId', requireUser, async (req, res, next) => {
  const id = req.params.activityId;
  const { name, description } = req.body;

  try {
    const updatedActivity = await updateActivity({ id, name, description });
    if (updatedActivity) {
      res.send(updatedActivity);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = activitiesRouter;


