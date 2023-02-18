// IMPORTED MODULES.
const express = require('express');
const config = require('config');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');


// ROUTES.
const UserRoutes = require('./routes/user.routes.js');


// .
const app = express();


app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer().none());
app.use(morgan('tiny'));



// .
app.use('/api/users', UserRoutes)



app.listen(config.server.port, () => {
    console.log(`Server Started at ${config.server.port}. Click on http://${config.server.host}:${config.server.port}`)
});