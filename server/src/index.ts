import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'
import { labels, processObjectsData, visible_label } from './aviable_label';
import auth_router, { secret } from './auth'
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
import { UnprocessedData } from './model/unprocessedData';
import swaggerjsdoc from "swagger-jsdoc"
import swaggerUI from 'swagger-ui-express'

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


app.use('/user', users)
app.use('/auth', auth_router)
app.use('/', payments)
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

app.post('/preview', async (req, res): Promise<any> => {
  const dataId = req.body.dataId
  const data = await UnprocessedData.findOne({ _id: dataId })
  console.log('data', data, 'dataId', dataId)
  if (!data) return res.status(StatusCodes.BAD_REQUEST).json({ error: "Data not found!" });


  const libpath = `http://localhost:${PORT}/public`;
  const url_base = libpath + `/point_cloud/${data._id}/potree/`

  const dirs = await getPotreeSubdirectories(`/app/public/point_cloud/${data._id}/potree`)
  const datas = dirs.map((dir, index) => {
    return url_base + dir + `/metadata.json`
  })

  const res_data = {
    dataName: data.name,
    potreeDirs: datas,
    libpath: libpath,
  };

  return res.render('preview', res_data);
})

app.post('/view', async (req, res): Promise<any> => {
  const projectId = req.body.projectId;
  const token = req.body.token;

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

    const areasData = await Objects.find({
      dataId: project.dataId._id,
      objectId: { $in: project.targets }  // Filter to only those in target array
    }).select('centroid objectId')
    // console.log('areasData', areasData)

    const processedObject = processObjectsData(areasData, labels)


    const data = {
      dataName: project.name,
      potreeDirs: datas,
      libpath: libpath,
      interest_scheme: visible_label(project.targets),
      areasData: processedObject
    };

    return res.render('view3D', data);


  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid token" });
  }
});

app.post('/', async(req, res) => {
  const dataValue = req.body.data
  let selectedLabelsArray = [];

  console.log(dataValue)
  
  const libpath = `http://localhost:${PORT}/public`;
  const url_base = [libpath + `/point_cloud/${dataValue}/metadata.json`]

  // const dirs = await getPotreeSubdirectories(`/${dataValue}/metadata.json`)
  // // const datas = dirs.map((dir, index) => {
  // //   return url_base + `/metadata.json`
  // // })

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
    dataName: dataValue,
    libpath: `http://localhost:${PORT}/public`,
    interest_scheme: visible_label(selectedLabelsArray),
    potreeDirs:url_base,
  }
  console.log('data',data)

  res.render('viewCesium', data);
}
);


/**
 * @swagger
 * /:
 *   get:
 *     summary: Get overall statistics of the system
 *     description: Returns the total count of objects, users, and projects in the database.
 *     responses:
 *       200:
 *         description: Successfully retrieved system statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 objects:
 *                   type: integer
 *                   example: 120
 *                 users:
 *                   type: integer
 *                   example: 42
 *                 project:
 *                   type: integer
 *                   example: 15
 *       500:
 *         description: Server error while fetching statistics.
 */
app.get('/', async (_, res): Promise<any> => {
  const objects = await Objects.countDocuments({})
  const users = await User.countDocuments({})
  const project = await Project.countDocuments({})
  res.json({ objects, users, project })
})



const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Point Cloud API',
      version: '1.0.0',
      description: 'API documentation for your point cloud data application',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
  },
  apis: ['./**/*.ts'], // Adjust this path to where your route files are defined
};

const swaggerSpec = swaggerjsdoc(swaggerOptions);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));


app.listen(PORT, async () => {
  console.log(`🗄️ Server Fire on http:localhost:${PORT}`);
  // Connect To The Database
  const uri = 'mongodb://root:example123@mongo:27017/'
  // const uri = 'mongodb://root:example123@localhost:27017/'

  try {
    await mongoose.connect(uri, {});
    console.log("🛢️ Connected To Database");

  } catch (error) {
    console.log("⚠️ Error to connect Database", error);
  }
});

