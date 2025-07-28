const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const groupMessage = require('../models/GroupMessage'); 
const User = require('../models/User'); 








router.get('/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      username: { $regex: q, $options: 'i' }
    }).select('username _id').limit(10);
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

router.post('/groups/create', async (req, res) => {
  try {
    const { name, members, createdBy } = req.body;
    
    const newGroup = new Group({
      name,
      members,
      createdBy
    });
    
    const savedGroup = await newGroup.save();
    res.json(savedGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

router.get('/groups/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const groups = await Group.find({
      'members.username': username
    }).sort({ createdAt: -1 });
    
    res.json(groups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});



router.get('/groups/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const messages = await groupMessage.find({ groupId })
      .sort({ timestamp: 1 })
      .limit(100); 
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});



router.post('/groups/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { user, message, timestamp } = req.body;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const isMember = group.members.some(member => member.username === user);
    if (!isMember) {
      return res.status(403).json({ error: 'User not authorized to send messages to this group' });
    }
    
    const newMessage = new groupMessage({
      groupId,
      user,
      message,
      timestamp: timestamp || new Date()
    });
    
    const savedMessage = await newMessage.save();
    res.json(savedMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});



router.post('/groups/:groupId/add-member', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { username, userId } = req.body;
    
    const group = await Group.findByIdAndUpdate(
      groupId,
      {
        $addToSet: {
          members: { username, _id: userId }
        }
      },
      { new: true }
    );
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});



router.post('/groups/:groupId/remove-member', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { username } = req.body;
    
    const group = await Group.findByIdAndUpdate(
      groupId,
      {
        $pull: {
          members: { username }
        }
      },
      { new: true }
    );
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

module.exports = router;
