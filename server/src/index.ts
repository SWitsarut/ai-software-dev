import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import { visible_label } from './aviable_label';
import auth_router from './auth'
import upload_data from './point_cloud/upload_data'
import payments from './payments/payments'
import users from "./userdata/get_user"



const app = express();

dotenv.config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json())
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook/') {
    next(); // Do nothing with the body because I need it in a raw state.
  } else {
    express.json()(req, res, next);  // ONLY do express.json() if the received request is NOT a WebHook from Stripe.
  }
});




const PORT: number = 8080;


app.set('views', "views");
app.set('view engine', 'ejs');
app.use("/potree", express.static("public"));


//router
app.use('/user', users)
app.use('/auth', auth_router)
app.use('/', payments)
app.use('/upload', upload_data)

app.post('/', (req, res) => {
  const dataValue = req.body.data
  let selectedLabelsArray = [];

  try {
    if (req.body.selectedLabels) {
      const parsedLabels = JSON.parse(req.body.selectedLabels);
      console.log(parsedLabels)
      if (Array.isArray(parsedLabels) && parsedLabels.length > 0) {
        selectedLabelsArray = parsedLabels;
      }
    }
  } catch (err) {
    console.error("Error parsing selectedLabels:", err);
  }
  const data = {
    data: dataValue,
    libpath: `http://localhost:${PORT}/potree`,
    interest_scheme: visible_label(selectedLabelsArray)
  }
  if (req.body.data.split('/').length == 1) {
    res.render('index', data);
  } else {
    res.render('special', data);
  }
}
);


app.listen(PORT, async () => {
  console.log(`🗄️ Server Fire on http:localhost:${PORT}`);
  // Connect To The Database
  const uri = 'mongodb://root:example123@mongo:27017/'

  try {
    await mongoose.connect(uri, {});
    console.log("🛢️ Connected To Database");
  } catch (error) {
    console.log("⚠️ Error to connect Database", error);
  }
});
