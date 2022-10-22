const client = require('./client');
const { attachActivitiesToRoutines, getAllActivities} = require('./activities');
const { addActivityToRoutine } = require('./routine_activities');
const { getUserByUsername } = require('./users');

async function getRoutineById(id) {
  try {
    const { rows: [routine] } = await client.query(`
    SELECT *
    FROM routines
    WHERE routines.id=$1;
    `,[id]);

    return routine;

  } catch (error) {
    console.log(error);
  }
}

// added  const routinesArray so I could return it.
async function getRoutinesWithoutActivities() {
  // const routinesArray = [...getRoutinesWithoutActivities];
  try { 
    const {rows: routines} = await client.query(`
    SELECT *
    FROM routines;
    DELETE activities
    `,);
   
    return getAllActivities(routines);
   
  } catch(error) {
    console.log(error);
  }
}

//changed rows: routines to [allRoutines]; also put the array in the return
async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.id
    `);
    return addActivityToRoutine(routines);
  
  } catch (error) {
    console.log(error);
  }
}

//changed rows: [routines] to [allRoutines]; also changed in the return
async function getAllRoutinesByUser({username}) {
  try {
    const user = await getUserByUsername(username);
    const { rows: routines } = await client.query(`
    SELECT routines.*,users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.id
    WHERE "creatorId"=$1
    `,[user]);

    return addActivityToRoutine(routines);
  } catch (error) {
    console.log(error)
  } 
}

//changed rows: [routines] to [publicRoutines]; also in the return
async function getPublicRoutinesByUser({username}) {
  try {
    const { rows: [publicRoutines] } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.id
    JOIN routine_activities ON activities.count, activities.duration
    WHERE "creatorId"=$1
    AND "isPublic"=true
    `, [username]);  
    

  return publicRoutines
  } catch(error){
    console.log(error)
  }
}

// changed rows: routines to [publicRoutines]; also changed it in the return
async function getAllPublicRoutines() {
  try {
    const { rows: [publicRoutines]} = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.id
    WHERE "isPublic" = true
    `);
    
    return addActivityToRoutine(publicRoutines);
    } catch (error) {
      console.log(error)
  }
}

async function getPublicRoutinesByActivity({userId}) {
  try{
    const {rows:[routineActivity]} = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines.creatorId = users.id
      JOIN routine_activities ON routine_activities."routineId" = routines.id
      WHERE routines."isPublic" = true
      AND routine_activities.activityId=$1;
      `,[userId]);

      return routineActivity,(addActivityToRoutine);
    } catch(error) {
      console.log(error);
    }
  }

// added ON CONFLICT
//changed rows: [routine] to newRoutineData due to routines.spec expectation  Does not call for an array here.
async function createRoutine({creatorId, isPublic, name, goal}) {
  try {
    const { rows: [routineActivity] } = await client.query(`
    INSERT INTO routines ("creatorId", "isPublic", name, goal)
    VALUES($1, $2, $3, $4)
    ON CONFLICT (name) DO NOTHING
    RETURNING *;
    `, [creatorId, isPublic, name, goal]);

    return routineActivity;
  } catch (error) {
    console.log(error);
  }
}

async function updateRoutine({id, ...fields}) {
  let { routines } = fields;
  delete fields.routines;

  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`
  ).join(', ');

  try {
    if (setString.length > 0) {
      await client.query(`
      UPDATE routines
      SET &{setString}
      WHERE id=${id}
      RETURNING *;
      `, Object.values(fields));
    }

    if ( routines === undefined) {
      return await getRoutineById(id);
    }

    const routineList = await getAllRoutines(routines);
      routineList.map(
      routine => `${routine.id}`
    ).join(', ');
  } catch (error) {
    console.log(error);
  }

  return updateRoutine;
}

async function destroyRoutine(id) {
  try {
    await client.query(`
    DELETE FROM routine_activities
    WHERE routineId=$1;
    RETURNING *
    `, [id]); 
    const {rows:[routine]} = await client.query(`
    DELETE FROM routines
    WHERE id = $1
    RETURNING *
    `, [id]);

    return routine;
  } catch (error) {
    console.log(error);
  }
}


module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
}