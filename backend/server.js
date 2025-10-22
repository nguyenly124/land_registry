require('dotenv').config();

const express = require('express') 
const app = express()
const cors=require('cors') // cho phep frontend goi backend 
const pool = require('./src/config/db');

const authRouter = require('./src/routes/authRouter');
const landRouter = require('./src/routes/landRouter');
const fileRouter = require('./src/routes/fileRouter');
const userRouter=require('./src/routes/userRouter');
const dossierRouter=require('./src/routes/dossierRouter')
app.use(cors())
app.use(express.json())

app.use('/auth', authRouter);
app.use('/lands', landRouter);
app.use('/file', fileRouter);
app.use('/user',userRouter);
app.use('/dossier',dossierRouter)
// test route
app.get('/test-db', async (req, res) => {
  try {
    console.log("API received a request!");
    res.json({ message: "Connected successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
  }
});

app.listen(process.env.PORT, () => {
  console.log(` Server running on port ${process.env.PORT}`);
});

