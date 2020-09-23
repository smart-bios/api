import {Router} from 'express';
import User from '../models/user';
import auth from '../middllewares/auth';
import token from '../services/token';
import bcrypt from 'bcrypt';
import path from 'path'
import fs from 'fs'
import fsa from 'fs-extra'

const ruta = Router();


/*
|--------------------------------------------------------------------------
| Add user
|--------------------------------------------------------------------------
*/
ruta.post('/add', auth.verifyAdministrador, async(req, res) => {
//ruta.post('/add', async(req, res) => {

    let body = req.body;     
    try {    
        let user_email = await User.findOne({email : req.body.email});

        if(!user_email){

            body.password = await bcrypt.hash(body.password, 10);
            let new_user = await User.create(body);
            fs.mkdir(path.join(__dirname, `../../storage/${new_user._id}/tmp`), { recursive: true }, (err) => { 
                if (err) throw err;

                fs.mkdir(path.join(__dirname, `../../storage/${new_user._id}/results`), { recursive: true }, (err) => {
                    if (err) throw err;

                    res.json({
                        status: 'success',
                        message: 'Usuario registrado en la base de datos',
                    });                 
                });                                   
            });
        }else{
            res.json({
                status: 'failed',
                message: 'El email ya esta registrado en la base de datos'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'No se a podido registrar el usuario',
            error
        });
    }
});

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/
ruta.post('/login', async(req, res) => {
    try {
        let user = await User.findOne({email: req.body.email, state: true});
        if(user){    
            let match = await bcrypt.compare(req.body.password, user.password)
            if(match){
                const payload = {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    state: user.state
                }

                let tokenReturn = token.encode(payload);
                res.status(200).json({
                        status: 'success',
                        token: tokenReturn                 
                });
            }else{
                res.status(401).json({
                    status: 'failed',
                    message: "Username or password is incorrect"
                });
            }

        }else{
            res.status(401).json({
                status: 'failed',
                message: 'This user does not exist!'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'Unable to Sign In',
            error
        })
        
    }
})

/*
|--------------------------------------------------------------------------
| Delete user
|--------------------------------------------------------------------------
*/
ruta.delete('/delete/:id', auth.verifyAdministrador, async(req, res) => {
    
    let _id = req.params.id;

    try {
        let user = await User.findByIdAndDelete({_id});

        fs.rmdir(path.join(__dirname, '../../storage/'+user._id), {recursive: true}, (error) => { 
            if (error) { 
                res.status(500).json({
                    status: 'failed',
                    message: 'No se puede eliminar al ususario',
                    error
                })
            } 
            res.json({
                status: 'success',
                messague: 'usuario eliminado',
            })
        });

    } catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'No se puede eliminar al ususario',
            error
        })
    }    
});

/*
|--------------------------------------------------------------------------
| Clear tmp files
|--------------------------------------------------------------------------
*/
ruta.post('/clean', async(req, res) => {

    let tmp = path.join(__dirname, `../../storage/${req.body.user}/tmp`)

    fsa.emptyDir(tmp,  function(err){
        
        if (err) return console.error(err)
        
        res.json({
            message: 'removed temp files'
        })
      })
})


export default ruta