import userSchema from "../models/user.model";
import proccesData from "../service/proccesData";
import type { UserDocument } from "../types/interface/IUser";




const consumeMessages = () => {
  proccesData<UserDocument>("Auth-Topic", "auth-user-group", userSchema); //for user from post service
  proccesData<UserDocument>("Company-Topic", "company-user-group", userSchema); //for user from story service
};

export default consumeMessages
