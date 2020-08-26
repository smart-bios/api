import tokenService from '../services/token';

export default {

    /*
    |--------------------------------------------------------------------------
    | Permiso para todo los usuarios
    |--------------------------------------------------------------------------
    */
    verifyUsuario: async (req,res,next) => {

        if (!req.headers.token){
            return res.status(401).send({
                status: 'failed',
                message: 'No posee las credenciales para contiunar'
            });
        }
        
        const response = await tokenService.decode(req.headers.token);
        if (response.role === 'ADMIN_ROLE' || response.role === 'USER_ROLE'){
            next();
        } else{
            return res.status(403).send({
                status: 'failed',
                message: 'No tiene los permisos necesarios'
            });
        }
    },

    /*
    |--------------------------------------------------------------------------
    | Permiso para solo administradores
    |--------------------------------------------------------------------------
    */

    verifyAdministrador: async (req,res,next) => {
        if (!req.headers.token){
            return res.status(401).send({
                status: 'failed',
                message: 'No posee las credenciales para contiunar'
            });
        }
        const response = await tokenService.decode(req.headers.token);
        if (response.role === 'ADMIN_ROLE'){
            next();
        } else{
            return res.status(403).send({
                status: 'failed',
                message: 'No tiene los permisos necesarios'
            });
        }
    }
}