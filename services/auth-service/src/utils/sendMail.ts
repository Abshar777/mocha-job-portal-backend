import { Resend } from "resend"
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY)
const sendMail = async (
    to: string,
    subject: string,
    text: string,
    variables: Record<string, any>
) => {
    try {
        
        let i = 1;
        for (const key of variables.otp) {
            variables[`otp${i}`] = key;
            i++;
        }
        const template = fs.readFileSync(path.join(__dirname, "../template/email.template.html"), "utf-8");

        let htmlContent = template;
        for (const key in variables) {
            htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, "g"), variables[key]);
        }
        return await resend.emails.send({
            from: process.env.RESEND_DOMAINEAMIL as string,
            to: [to],
            subject,
            html: htmlContent,
        });
    } catch (error) {
        throw new Error((error as Error).message)
    }
}

export default sendMail;