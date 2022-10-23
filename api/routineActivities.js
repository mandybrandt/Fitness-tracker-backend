const express = require('express');
const {
  getRoutineActivityById,
  getRoutineById,
  updateRoutineActivity,
  destroyRoutineActivity,
} = require("../db");
const { requireUser } = require("./utilities");
const routine_activitiesRouter = express.Router();


routine_activitiesRouter.use((req, res, next) => {
  console.log("A request has been made to /routine_activities");

  next();
});

// PATCH /api/routine_activities/:routineActivityId
routine_activitiesRouter.patch('/:routineActivityId', requireUser, async (req, res, next) => {
  const { routineActivityId } = req.params;
  const { count, duration } = req.body;
  const routineActivity = await getRoutineActivityById(routineActivityId);
  const { routineId } = routineActivity;

  try {
    const routine = await getRoutineById(routineId);
    if (req.user.id === routine.creatorId) {
      const updatedRoutineActivity = await updateRoutineActivity({
        id: routineActivityId,
        count,
        duration,
      });

      res.send(updatedRoutineActivity);
    } else {
      next()
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routine_activities/:routineActivityId
routine_activitiesRouter.delete("/:routineActivityId", requireUser, async (req, res, next) => {
  const { routineActivityId } = req.params;
  const routineActivity = await getRoutineActivityById(routineActivityId);

  try {
    const routine = await getRoutineById(routineActivity.routineId);
    if (req.user.id === routine.creatorId) {
      const deletedRoutineActivity = await destroyRoutineActivity(routineActivityId)
      res.send(deletedRoutineActivity);
    } else {
      next({ message: "Error: Only the creator can delete a routine" });
    }
  } catch ({ message }) {
    next({ message });
  }
}
)
module.exports = routine_activitiesRouter;
