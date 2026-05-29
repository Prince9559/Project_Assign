const { SupportTicket, User } = require('../models');


const raiseTicket = async (req, res) => {
    try {
        const { user_id, role, name, email, issue_title, issue_detail, priority } = req.body;
        if (!issue_title || !issue_detail || !role || !email) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields:issue_title,issue_detail,role,email",
            })
        }
        const ticket = await SupportTicket.create({
            user_id,
            name,
            email,
            role,
            issue_title,
            issue_detail,
            priority: priority || 'MEDIUM',
        })
        return res.status(201).json({
            success: true,
            message: "Ticket raised successfully",
            ticket: ticket,
        })
    } catch (error) {
        console.log("Error while raising a ticket:", error);
        return res.status(500).json({
            sucess: false,
            message: "Internal server error while raising a ticket",
            error: error.message
        })
    }
}

const getTicketByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const tickets = await SupportTicket.findAll({
            where: { role: role },
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'email', 'user_role']
            }]
        });
        if (tickets.length == 0) {
            return res.status(404).json({
                success: false,
                message: "No tikets found for this role."
            })
        }
        return res.status(200).json({
            success: true,
            message: "Ticket fetched successfully",
            data: tickets
        })
    } catch (error) {
        console.log("Error while fetching tickets by role:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching tickets by role",
            error: error.message,
        })
    }
}

module.exports = {
    raiseTicket,
    getTicketByRole
}