import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'
import { visible_label } from './aviable_label';
import auth_router, { secret } from './auth'
// import upload_data from './point_cloud/upload_data'
import payments from './payments/payments'
import users from "./userdata/get_user"
import teams from "./Project/team"
import request_end_point from "./point_cloud/request"
import { Objects } from './model/objects';
import { User } from './model/user';
import { Project } from './model/project';
import projects_end_point from "./Project/projects"
import authenticateToken from './middleware/authenticateToken';
import { StatusCodes } from 'http-status-codes';
import objects_end_point from "./Project/objects"
import fs from 'fs'

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
app.use("/public", express.static("public"));


//router
app.use('/user', users)
app.use('/auth', auth_router)
app.use('/', payments)
// app.use('/upload', upload_data)
app.use('/point_cloud', request_end_point)
app.use('/objects', objects_end_point)
app.use('/teams', teams)
app.use('/projects', projects_end_point)


async function getPotreeSubdirectories(baseDir: string): Promise<string[]> {
  try {
    const dirs = await fs.promises.readdir(baseDir)
    return dirs
  } catch (error) {
    console.log('error', error)
    return []
  }
}
// try {
//   // Read all subdirectories
//   const dirs = await fs.promises.readdir(baseDir, { withFileTypes: true });
//   console.log('dirs', dirs)
//   // Filter for directories and return their paths
//   const potreeDirs = dirs
//     .filter(dirent => dirent.isDirectory())
//     .map(dirent => `${baseDir}/${dirent.name}`);

//   return potreeDirs;
// } catch (error) {
//   console.error('Error reading potree directories:', error);
//   return []; // Return empty array if there's an error
// }
// }


app.post('/view', async (req, res): Promise<any> => {
  const projectId = req.body.projectId;
  const teamId = req.body.teamId;
  const token = req.body.token;
  // console.log(token);

  if (!token) return res.status(StatusCodes.FORBIDDEN).json({ "error": "You don't have access" });

  // Use promisify to convert jwt.verify to return a promise
  const verifyJwt = (token: string, secret: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err: any, decoded: any) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });
  };

  try {
    // Wait for the verification to complete
    const decoded = await verifyJwt(token, secret);
    const userId = decoded.userId; // or userId = decoded.userId based on your token structure

    // console.log('projectId:', projectId, 'teamId:', teamId, 'userId:', userId);

    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ error: "User ID not found in token" });

    const user = await User.findOne({ userId });
    if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({ error: "User not found" });

    // Find project 
    const project = await Project.findOne({ _id: projectId }).populate('dataId');
    if (!project) return res.status(StatusCodes.BAD_REQUEST).json({ error: "Project not found!" });


    const libpath = `http://localhost:${PORT}/public`;
    const url_base = libpath + `/point_cloud/${project.dataId._id}/potree/`
    // const dirs = await getPotreeSubdirectories(`/app/public/point_cloud/${project.dataId._id}/potree`)
    const dirs = await getPotreeSubdirectories(`/app/public/point_cloud/${project.dataId._id}/potree`)
    const datas = dirs.map((dir, index) => {
      return url_base + dir + `/metadata.json`
    })
    // console.log('datas', datas)
    // console.log('dirsdirs', dirs)

    const areasData = await Objects.find({ dataId: project.dataId._id })
    // console.log('areasData', areasData)
    const data = {
      dataName: project.name,
      potreeDirs: datas,
      libpath: libpath,
      interest_scheme: visible_label(project.targets),
      areasData: areasData
    };

    return res.render('view3D', data);


    // res.json({
    //   project,
    //   teamId,
    //   user: req.user
    // });
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid token" });
  }
});

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
    libpath: `http://localhost:${PORT}/public`,
    interest_scheme: visible_label(selectedLabelsArray)
  }
  // if (req.body.data.split('/').length == 1) {
  res.render('index', data);
  // } else {
  // res.render('special', data);
  // }
}
);

app.get('/', async (_, res): Promise<any> => {
  const objects = await Objects.countDocuments({})
  const users = await User.countDocuments({})
  const project = await Project.countDocuments({})
  res.json({ objects, users, project })
})


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

// app.listen(PORT, async () => {
//   console.log(`🗄️ Server Fire on http://localhost:${PORT}`);

//   const uri = 'mongodb://root:example123@mongo:27017/';

//   try {
//     await mongoose.connect(uri, {});
//     console.log("🛢️ Connected To Database");

//     // Drop the unique index on teamId only if it exists
//     const db = mongoose.connection.db;
//     const collection = db?.collection('projects');

//     const indexes = await collection?.indexes();
//     if (indexes?.some(index => index.name === "teamId_1")) {
//       await collection?.dropIndex("teamId_1");
//       console.log("✅ Dropped unique index on teamId");
//     } else {
//       console.log("ℹ️ No unique index on teamId found");
//     }

//   } catch (error) {
//     console.log("⚠️ Error connecting to Database", error);
//   }
// });
