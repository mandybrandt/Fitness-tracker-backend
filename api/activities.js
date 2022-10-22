const express = require("express");
const router = express.Router();
const { requireUser } = require("./utilities");
const { createActivity, updateActivity, getAllActivities, getPublicRoutinesByActivity } = require("../db");
// GET /api/activities/:activityId/routines
router.get('/:activityId/routines', async (req, res, next) => {
    try {
      const id = req.params.activityId;
      const activity = { id: id };
      const routines = await getPublicRoutinesByActivity(activity);
      if (routines.length === 0)
        res.send({
          message: `Activity ${id} not found`,
          name: 'ActivityDoesNotExistError',
          error: 'Activity does not exist',
        });
      res.send(routines);
    } catch ({ name, message }) {
      next({ name, message });
    }
  })
// GET /api/activities
router.get('/', async (req, res) => {
  const activities = await getAllActivities();
  res.send({ activities });
});
// POST /api/activities
router.post('/', requireUser, async (req, res, next) => {
  const { name, description } = req.body;
  const activityData = { name, description };
  try {
    const activity = await createActivity(activityData);
    if (!activity) {
      next({
        name: "ErrorGettingActivities",
        message: "Activity does not exist",
      });
    }
    res.send({ activity });
  } catch (error) {
    next(error);
  }
});
// PATCH /api/activities/:activityId
router.patch('/:activityId', requireUser, async (req, res, next) => {
  const { activityId } = req.params;
  const { name, description } = req.body;
  const updateFields = {};
  if (name) {
    updateFields.name = name;
  }
  if (description) {
    updateFields.description = description;
  }
  try {
    if (req.user) {
      const updatedActivity = await updateActivity(activityId, updateFields);
      res.send({ activity: updatedActivity });
    } else {
      next({
        name: "UserNotLoggedIn",
        message: "Login to update activity",
      });
    }
  } catch ({ name, description }) {
    next({ name, description });
  }
});
module.exports = router;


