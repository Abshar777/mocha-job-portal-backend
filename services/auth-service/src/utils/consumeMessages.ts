import userSchema from "../models/user.model";
import proccesData from "../service/proccesData";
import type { UserDocument } from "../types/interface/IUser";




const consumeMessages = () => {
  proccesData<UserDocument>("User-Topic", "auth-group", userSchema);
};

export default consumeMessages
