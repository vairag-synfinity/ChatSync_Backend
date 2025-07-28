const mongoose = require("mongoose");



const groupSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true
    },

    members: [{
        username: { type: String, required: true },
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],

    createdBy:
    {
        type: String,
        required: true
    },

    createdAt:
    {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model("Group", groupSchema);
