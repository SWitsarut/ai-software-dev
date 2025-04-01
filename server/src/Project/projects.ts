import express from 'express'
import authenticateToken from '../middleware/authenticateToken'
import { MembersRoles, TeamsMember } from '../model/teamMembers'
import { User } from '../model/user'
import { StatusCodes } from 'http-status-codes'
import { PaymentStatus, Project } from '../model/project'
import { stripe } from '../payments/payments'

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


router.get('/detailed/:teamId/projects/:projectId', authenticateToken, async (req, res): Promise<any> => {
    try {
        const { projectId, teamId } = req.params;

        const project = await Project.findOne({
            _id: projectId,
            teamId: teamId
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({
            _id: project._id,
            name: project.name,
            amount: project.amount,
            currency: project.currency || 'thb',
            status: project.status
        });
    } catch (error) {
        console.error('Error fetching project details:', error);
        res.status(500).json({ error: 'Failed to fetch project details' });
    }

})
router.post(`/payment-intent`, authenticateToken, async (req, res): Promise<any> => {
    try {
        const { teamId, projectId } = req.body;

        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        // Find the project in the database
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Verify team ownership if needed
        if (project.teamId.toString() !== teamId) {
            return res.status(403).json({ error: 'Project does not belong to this team' });
        }

        if (project.status === PaymentStatus.paid) {
            return res.status(400).json({ error: 'Project has already been paid for' });
        }

        // Get the amount from the project
        const amount = project.amount;
        const currency = project.currency || 'thb';

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid project amount' });
        }

        // Create a payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to smallest currency unit (cents/satang)
            currency: currency,
            metadata: {
                projectId: project._id.toString(),
                teamId: project.teamId.toString()
            }
        });

        // Return client secret to frontend
        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            amount: amount,
            currency: currency
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
})



export default router