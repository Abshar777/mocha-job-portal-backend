import bcrypt from "bcryptjs";

export const hash = async (code: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(code, salt);
}
