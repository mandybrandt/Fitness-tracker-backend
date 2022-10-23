const express = require('express');
const { getUserById } = require("../db");
const activitiesRouter = require("./activities");
const jwt = require("jsonwebtoken");
const { JWT_SECRET = 'neverTell' } = process.env;
const healthRouter = require("./health");
const routinesRouter = require("./routines");
const usersRouter = require("./users");
const routine_activitiesRouter = require("./routine_activities");
const apiRouter = express.Router();
const cors = require('cors');
const app = express()

app.use(cors())
app.get('/products/:id', function (req, res,) {
  res.json({ msg: 'This is CORS-enabled for all origins!' })
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

  try {
    if (!auth) {
      next();
    } else if (auth.startsWith(prefix)) {
      const token = auth.slice(prefix.length);

      try {
        const { id } = jwt.verify(token, JWT_SECRET);

        if (id) {
          req.user = await getUserById(id);
          next();
        }
      } catch ({ name, message }) {
        next({
          name: "AuthorizationHeaderError",
          message: `Authorization token must start with ${prefix}`
        });
      }
    }
  } catch ({ name, message }) {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`
    })
  }
});

apiRouter.use("/health", healthRouter);
// ROUTER: /api/users
apiRouter.use('/users', usersRouter);

// ROUTER: /api/activities
apiRouter.use('/activities', activitiesRouter);

// ROUTER: /api/routines
apiRouter.use('/routines', routinesRouter);

// ROUTER: /api/routine_activities
apiRouter.use('/routine_activities', routine_activitiesRouter);
module.exports = apiRouter;