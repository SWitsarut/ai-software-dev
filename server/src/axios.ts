import axios from 'axios';
import dotenv from 'dotenv'

dotenv.config();


export default axios.create({
    baseURL: process.env.MODEL_SERVER_ENDPOINT
    // baseURL: "http://localhost:8000"
});