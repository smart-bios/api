
import { EMLINK } from 'constants'
import { Router } from 'express'
import fs from 'fs'
import nodemailer from 'nodemailer'



export default {


    sendEmail: (email, cb) => {

        const transporter = nodemailer.createTransport({
            pool: true,
            host: process.env.HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS_EMAIL
            },
            tls: {
                rejectUnauthorized: false
        
            }
        })

        let msj = {
            from: "'Red Genomica INIA' <redgenomica@cancerbacteriano.cl>",
            to: email.to,
            subject: email.subject,
            text: email.text,
            attachments: [
                {
                    path: email.attachments
                }
            ]
        }

        
        transporter.verify(function(error, success) {
            if (error) {
                console.log('ERROR Verify email',error);
                return cb('ERROR Verify email', null)
                
            } else {
                console.log("Server is ready to take our messages");
                transporter.sendMail(msj, function(err, info){
                    if(err){
                        console.log(err)
                        return cb('ERROR SEND email', null)
                    }else{
                        return cb(null, 'CORREO ENVIADO')
                    }
                })
            }
        });
    }
}