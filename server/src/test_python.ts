import express from 'express'
import axios from './axios'

const router = express.Router()


router.get('/', async (req, res) => {
    const response = await axios.get('/')
    console.log(response.data)
    res.send(response.data)
})

export default router