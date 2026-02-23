const Message = require("../models/messageModel");
const User = require("../models/userModel");

// GET /api/messages/conversations — get all unique conversations with last message + unread count
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name role avatar isDeleted")
      .populate("receiver", "name role avatar isDeleted");

    const convoMap = new Map();

    for (const msg of messages) {
      const otherId = msg.sender._id.toString() === userId.toString() ? msg.receiver._id.toString() : msg.sender._id.toString();

      if (!convoMap.has(otherId)) {
        const otherUser = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;

        const unread = await Message.countDocuments({
          sender: otherId,
          receiver: userId,
          read: false,
        });

        convoMap.set(otherId, {
          user: otherUser,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unread,
        });
      }
    }

    const conversations = Array.from(convoMap.values());
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/messages/:userId — get full conversation thread with a specific user
const getThread = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name role avatar")
      .populate("receiver", "name role avatar");

    await Message.updateMany({ sender: otherId, receiver: userId, read: false }, { read: true });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/messages — send a message
const sendMessage = async (req, res) => {
  try {
    const { receiver, content } = req.body;

    if (!receiver || !content) return res.status(400).json({ message: "receiver and content are required" });

    const receiverUser = await User.findById(receiver);
    if (!receiverUser) return res.status(404).json({ message: "Receiver not found" });

    // Prevent messaging deleted users
    if (receiverUser.isDeleted) return res.status(400).json({ message: "Cannot message a deleted user" });

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
    });

    const populated = await message.populate([
      { path: "sender", select: "name role avatar" },
      { path: "receiver", select: "name role avatar" },
    ]);

    res.status(201).json({ message: "Message sent", data: populated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/messages/:messageId — sender deletes their own message
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) return res.status(403).json({ message: "You can only delete your own messages" });

    await message.deleteOne();
    res.status(200).json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/messages/conversation/:userId — delete all messages between two users
const deleteConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherId = req.params.userId;

    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId },
      ],
    });

    res.status(200).json({ message: "Conversation deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/messages/contacts — get list of people this user can message (excludes deleted)
const getContacts = async (req, res) => {
  try {
    const { role, _id } = req.user;
    let filter = { isDeleted: false }; // always exclude deleted users

    if (role === "admin") {
      filter.role = { $in: ["employee", "client"] };
    } else if (role === "employee") {
      const Project = require("../models/projectModel");
      const projects = await Project.find({ employees: _id }).populate("client", "_id isDeleted");
      const clientIds = projects.filter((p) => p.client && !p.client.isDeleted).map((p) => p.client._id);
      filter = {
        isDeleted: false,
        $or: [{ role: "admin" }, { _id: { $in: clientIds } }],
      };
    } else if (role === "client") {
      const Project = require("../models/projectModel");
      const projects = await Project.find({ client: _id }).populate("employees", "_id isDeleted");
      const employeeIds = projects.flatMap((p) => p.employees.filter((e) => !e.isDeleted).map((e) => e._id));
      filter = {
        isDeleted: false,
        $or: [{ role: "admin" }, { _id: { $in: employeeIds } }],
      };
    }

    const contacts = await User.find(filter).select("name email role company avatar");
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getConversations, getThread, sendMessage, deleteMessage, deleteConversation, getContacts };
