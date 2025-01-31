import userSchema from "../models/userModel";
import proccesData from "../service/proccesData";
import type { UserDocument } from "../types/interface/IUser";




const consumeMessages = () => {
  proccesData<UserDocument>("Post-Topic-User", "user-group", userSchema); //for user from post service
  proccesData<UserDocument>("Story-topic", "user-group-story", userSchema); //for user from story service
};

export default consumeMessages
