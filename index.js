// IMPORTED MODULES.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const session = require('express-session');


const config = require('./config/config.js');
const AuthorizationMiddleware = require('./middlewares/Authorization.middleware.js');
// ROUTES.
const UserRoutes = require('./services/user.routes.js');



// .
const app = express();


app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer().none());
app.use(morgan('tiny'));
app.use(session({
    secret: config.session.sessionKey,
    saveUninitialized:true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false 
}));
app.use(AuthorizationMiddleware());






// .
app.use('/api/users', UserRoutes);





app.listen(config.server.port, () => {
    console.log(`Server Started at ${config.server.port}. Click on http://${config.server.host}:${config.server.port}`)
});


