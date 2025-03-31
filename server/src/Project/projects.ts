import express from 'express'
import authenticateToken from '../middleware/authenticateToken'
import { MembersRoles, TeamsMember } from '../model/teamMembers'
import { User } from '../model/user'
import { StatusCodes } from 'http-status-codes'
import { Project } from '../model/project'

const router = express.Router()

router.get('/:teamId', authenticateToken, async (req, res): Promise<any> => {
    const userId = req.user?.userId
    const teamId = req.params.teamId;
    const user = await User.findOne({ userId })
    // console.log('user', user, "teamId", teamId)
    if (!user) return res.status(StatusCodes.FORBIDDEN).json({ error: "User not found!" })
    const membership = await TeamsMember.findOne({ userId: user._id, teamId })
    if (!membership) return res.status(StatusCodes.FORBIDDEN).json({ error: "You aren't member of the team!" })
    const projects = await Project.find({ teamId: membership.teamId })
    if (!projects) return res.status(StatusCodes.BAD_REQUEST).json({ error: "No projects found!" })
    return res.status(StatusCodes.OK).json(projects)
})


export default router