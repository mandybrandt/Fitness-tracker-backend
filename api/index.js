const express = require('express');
const cors = require('cors');
const app = express()
const apiRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET = 'neverTell' } = process.env;
const {getUserById} = require("../db")
app.use(cors())
app.get('/products/:id', function (req, res,) {
    res.json({msg: 'This is CORS-enabled for all origins!'})
})
app.listen(80, function () {
    console.log('CORS-enabled web server listening on port 80')
})
// GET /api/health
apiRouter.get('/health', async () => {
    console.log('server is running on port 80')
});
apiRouter.use(async (req, res, next) => {
    const prefix = 'Bearer';
    const auth = req.header('Authorization');
    if (!auth) { // nothing to see here
      next();
    } else if (auth.startsWith(prefix)) {
      const token = auth.slice(prefix.length);
      try {
        const parsedToken = jwt.verify(token, JWT_SECRET);
        const id = parsedToken && parsedToken.id
        if (id) {
          req.user = await getUserById(id);
          next();
        }
      } catch (error) {
        next(error);
      }
    } else {
      next({
        name: 'AuthorizationHeaderError',
        message: `Authorization token must start with ${ prefix }`
      });
    }
  });
// ROUTER: /api/users
const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);
// ROUTER: /api/activities
const activitiesRouter = require('./activities');
apiRouter.use('/activities', activitiesRouter);
// ROUTER: /api/routines
const routinesRouter = require('./routines');
apiRouter.use('/routines', routinesRouter);
// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
apiRouter.use('/routine_activities', routineActivitiesRouter);
module.exports = apiRouter;