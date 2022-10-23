const express = require("express");
const routinesRouter = express.Router();
const {
  getAllPublicRoutines,
  createRoutine,
  getRoutineById,
  updateRoutine,
  destroyRoutine,
  addActivityToRoutine,
} = require('../db');

const { requireUser } = require("./utilities");

// GET /api/routines
routinesRouter.use((req, res, next) => {
  console.log("A request has been made to /routines");

  next();
})

routinesRouter.get('/', async (req, res, next) => {
  try {
    const routines = await getAllPublicRoutines();

    if (routines) {
      res.send(routines);
    } else {
      next();
    }
  }
  catch (error) {
    next(error);
  }
});

// POST /api/routines
routinesRouter.post('/', requireUser, async (req, res, next) => {
  const { isPublic, name, goal } = req.body;
  const creatorId = req.user.id;
  try {
    const routine = await createRoutine({ creatorId, isPublic, name, goal });

    if (routine) {
      res.send(routine);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
})

// PATCH /api/routines/:routineId
routinesRouter.patch("/:routineId", requireUser, async (req, res, next) => {
  const id = req.params.routineId;
  const { isPublic, name, goal } = req.body;
  try {
    const routineUpdated = await updateRoutine({ id, isPublic, name, goal });
    if (routineUpdated) {
      res.send(routineUpdated);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routines/:routineId
routinesRouter.delete("/:routineId", requireUser, async (req, res, next) => {
  const { routineId } = req.params;
  let routine = await getRoutineById(req.params.routineId);
  try {
    if (req.user.id === routine.creatorId) {
      const deleteRoutine = await destroyRoutine(routineId);
      res.send(deleteRoutine);
    } else {
      next({
        message: "You must be the creator of this routine to delete it"
      })
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/routines/:routineId/activities
routinesRouter.post("/:routineId/activities", requireUser, async (req, res, next) => {
  const routineId = req.params.routineId;
  const { activityId, count, duration } = req.body;

  try {
    const routine = await getRoutineById(routineId);
    const activity = await addActivityToRoutine({ routineId, activityId, count, duration });

    if (req.user.id === routine.creatorId) {
      res.send(activity);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = routinesRouter;