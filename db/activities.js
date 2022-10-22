const client = require("./client")

// database functions


async function getAllActivities() {
  try {
    const { rows:activities } = await client.query(`
    SELECT *
    FROM activities
`);
    return activities;
  } catch (error) {
    console.log("Error getting activities")
    throw error;
  }
}

async function getActivityById(activityId) {
  try {
    const { rows: [activity] } = await client.query(`
    SELECT *
    FROM activities
    WHERE id=$1
    `, [activityId]);

    return activity;
  } catch (error) {
    console.log("Error getting activity by Id")
    throw error;
  }
}
async function getActivityByName(name) {
  try {
    const { rows: [activity] } = await client.query(`
    SELECT *
    FROM activities
    WHERE name=$1
    `, [name]);

    return activity;
  } catch (error) {
    console.log("Error getting activity by name")
    throw error;
  }
}
// select and return an array of all activities
async function attachActivitiesToRoutines(routines) {
  const routineArray = [...routines];
  const attach = routines.map((routine) => routine.id);
  if (routines.length === 0) {
    return;
  }

  try {
    const { rows: [activities] } = await client.query(`
    SELECT activities.*, routine_activities.duration, routine_activities.count,
    routine_activities.id AS routineActivityId, routine_activities.routineId
    FROM activities
    JOIN routine_activities ON routine_activities.activityId = activities.id
    WHERE routine_activities.routineId IN (${attach});
    `, routines);
    for (const routine of routineArray) {
      const addActivities = activities.filter((activity) => routine.id === activity.routineId);
      routine.activities = addActivities;
    }

    return routineArray;
  } catch (error) {
    console.log("Error attaching activities to routines")
    throw error;
  }
}

// return the new activity
async function createActivity({ name, description }) {
  try {
    const { rows: [activity] } = await client.query(`
    INSERT INTO activities(name, description)
    VALUES($1, $2)
    ON CONFLICT(name) DO NOTHING
    RETURNING *
    `, [name, description]);

    return activity;
  } catch (error) {
    console.log("Error creating activity")
    throw error;
  }
}

// don’t try to update the id
// do update the name and description
// return the updated activity
async function updateActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map((key,index)=> `"${key}"=$${index + 1}`).join(",");
  try {
    if(setString.length > 0) {
      const { rows } = await client.query(
        `UPDATE activities
        SET ${setString}
        WHERE id = ${id}
        RETURNING *;
      `, Object.values(fields));
    return rows[0];
    }
    
  } catch (error) {
    console.log(error);
    throw error;
  }
}
module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
}