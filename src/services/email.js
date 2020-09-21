
import { Router } from 'express'
import fs from 'fs'
import nodemailer from 'nodemailer'



export default {


    sendEmail: (email, cb) => {

        const {to, subject, text, adjunto} = email

        let msj ={
            from: "'Red Genomica INIA'",
            to,
            subject,
            text: 'prueba de correo',
            attachments: [
                {
                    path: adjunto
                }
            ]
        }
        console.log('Mensaje:', msj)
        
        transporter.sendMail(msj, function(err, info){
            if(err){
                return cb('FAIL EMAIL', null)
            }
            
            return cb(null, info)
        })
    }
}