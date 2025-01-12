import express from 'express';
import cors from "cors";
const app = express();

app.use(cors())
app.use(express.json())

const PORT: number = 8080;


app.get('/', (_, res) => {
  // res.send('Express + TypeScript Server');
  res.json({ "msg": "SIGMA" })
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
