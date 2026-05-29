const { NeedAssistance } = require("../models");

// Create Ticket
const createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;

    // user_id from auth middleware (recommended)
    const user_id = req.user?.id || req.body.user_id;

    if (!user_id || !subject || !message) {
      return res.status(400).json({
        error: "User, subject and message are required",
      });
    }

    const attachment = req.file
  ? req.file.path
  : req.body.attachment || null;

    const ticket = await NeedAssistance.create({
      user_id,
      subject,
      message,
      attachment,
    });

    return res.status(201).json({
      message: "Ticket created successfully",
      data: ticket,
    });

  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// Get All Tickets (Admin use)
const getAllTickets = async (req, res) => {
  try {
    const tickets = await NeedAssistance.findAll({
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(tickets);

  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// Get Tickets by User
const getUserTickets = async (req, res) => {
  try {
    const user_id = req.user?.id || req.params.user_id;

    const tickets = await NeedAssistance.findAll({
      where: { user_id },
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(tickets);

  } catch (error) {
    console.error("Error fetching user tickets:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// Update Ticket (status / response)
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const ticket = await NeedAssistance.findByPk(id);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    await ticket.update(updates);

    return res.status(200).json({
      message: "Ticket updated successfully",
      data: ticket,
    });

  } catch (error) {
    console.error("Error updating ticket:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// Delete Ticket
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await NeedAssistance.findByPk(id);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    await ticket.destroy();

    return res.status(200).json({
      message: "Ticket deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting ticket:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  createTicket,
  getAllTickets,
  getUserTickets,
  updateTicket,
  deleteTicket,
};