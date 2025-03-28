import express from 'express'
import authenticateToken from '../middleware/authenticateToken'
import { User } from '../model/user'
import { Teams } from '../model/teams'
import { StatusCodes } from 'http-status-codes'
import { uploadImage } from '../middleware/file'
import { isValidRole, MembersRoles, TeamsMember } from '../model/teamMembers'

const router = express.Router()

router.post('/create', authenticateToken, uploadImage.single('image'), async (req, res): Promise<any> => {
    const userId = req.user?.userId
    const { name } = req.body
    const image = req.file

    if (!name) return res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing team name." })
    const id = await User.findOne({ userId }).select('_id')
    const createdTeam = await Teams.create({ createBy: id, name, image: image?.filename || "" })

    await TeamsMember.create({ teamId: createdTeam._id, userId: id, role: MembersRoles.admin, addedBy: id })

    if (!createdTeam) return res.status(StatusCodes.BAD_REQUEST).json({ error: "Team not created" })
    return res.status(StatusCodes.OK).json(createdTeam)
})

// If using Express router
router.get('/list', authenticateToken, async (req, res): Promise<any> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ userId }).select('_id');
        // console.log('user', user)
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'User not found' });
        }
        // Find team memberships
        const teams = await TeamsMember.find({ userId: user._id.toString() }).populate({
            path: 'teamId', populate: {
                path: 'createBy', select: 'name'
            }
        });


        return res.status(StatusCodes.OK).json(teams);
    } catch (error) {
        console.error('Error fetching team memberships:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Unable to fetch team memberships',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.get('/id/:id', authenticateToken, async (req, res): Promise<any> => {
    const userId = req.user?.userId;
    const teamId = req.params.id;

    const user = await User.findOne({ userId });
    if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: "User not found" });
    }


    const member = await TeamsMember.findOne({ teamId, userId: user._id }).select("role");
    if (!member) {
        return res.status(StatusCodes.FORBIDDEN).json({ error: "You are not a member of the team" });
    }
2
    const members = await TeamsMember.find({ teamId }).populate('userId', 'name avatar');
    const teamInfo = await Teams.findById(teamId).populate('createBy', 'name')

    return res.status(StatusCodes.OK).json({ caller: member, members, teamInfo })
})

router.post('/update/role', authenticateToken, async (req, res): Promise<any> => {
    const { target, teamId, targetRole } = req.body
    if (!target || !teamId || !targetRole)
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing target,teamId or targetRole" });

    if (!isValidRole(targetRole)) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Role is not valid.' });

    const caller = await User.findOne({ userId: req.user?.userId })
    if (!caller) return res.status(StatusCodes.UNAUTHORIZED).json({ error: "User not found." })

    const role = await TeamsMember.findOne({ userId: caller._id, teamId }).select('role')
    if (!role) return res.status(StatusCodes.BAD_REQUEST).json({ error: "User not found." })
    if (role.role !== MembersRoles.admin) res.status(StatusCodes.FORBIDDEN).json({ error: "User not found." })

    await TeamsMember.findByIdAndUpdate(target, { role: targetRole })
    return res.status(StatusCodes.OK)
})


export default router