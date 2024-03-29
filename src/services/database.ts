import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGO_DB);
mongoose.set('strictQuery', true);

const userSchema = new mongoose.Schema<IUserInfo>({
  _id: { type: String, required: true },
  todoistToken: { type: String, required: true },
  todoistProjectId: { type: String, required: true },
  noResponse: { type: Boolean, required: false },
  threadLabel: { type: String, required: false },
  tweetLabel: { type: String, required: false },
  todoistId: { type: String, required: true },
}, { strict: true });

const UserInfo = mongoose.model<IUserInfo>('users', userSchema);

export default UserInfo;
