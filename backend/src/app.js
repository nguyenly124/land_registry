const express = require('express');
const cors = require('cors');
const multer = require('multer');
const errorHandler = require('./middlewares/errorHandler');

const authRouter = require('./routes/authRouter');
const landRouter = require('./routes/landRouter');
const fileRouter = require('./routes/fileRouter');
const userRouter = require('./routes/userRouter');
const dossierRouter = require('./routes/dossierRouter');
const notificationRouter =require('./routes/notificationRouter');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/lands', landRouter);
app.use('/file', fileRouter);
app.use('/user', userRouter);
app.use('/dossier', dossierRouter);
app.use('/notifications',notificationRouter);
// Test route
app.get('/test-db', (req, res) => {
  res.json({ message: 'Connected successfully' });
});
app.use(errorHandler);
module.exports = app;
