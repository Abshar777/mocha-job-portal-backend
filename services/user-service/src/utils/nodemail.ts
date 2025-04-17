import nodemailer from 'nodemailer';
import fs from "fs";
import path from "path";


export const sendEmail = async (
    to: string,
    subject: string,
    text: string,
    variables: Record<string, any>
) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAILER_EMAIL,
            pass: process.env.MAILER_PASSWORD,
        },
    })
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

    const mailOptions = {
        to,
        subject,
        text,
        html: htmlContent,
        from: `"Mocha" <${process.env.MAILER_EMAIL}>`

    }
    
    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) throw new Error(`otp mail sending failed \n err:${error.message}`)
        else {
            console.log("otp mail send succefully",info)
        }
    })
}