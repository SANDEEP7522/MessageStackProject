import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: [true, 'message body is required']
    },
    images: {
      type: String // Allows multiple images as an array of URLs or file paths
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: [true, 'channel is required']
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'senderId is required']
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required']
    }
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
