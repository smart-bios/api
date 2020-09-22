import jwt from 'jsonwebtoken';
import User from '../models/user';


export default {

    /*
    |--------------------------------------------------------------------------
    | Generar token para usuario logeado
    | --------------------------------------------------------------------------
    |
     */
    encode: (payload) => {
        const token = jwt.sign(payload, process.env.SECRET_KEY,{
            expiresIn: 60 * 60 * 24  // expires in 24 hours
        })

        return token
    },

    /*
    |--------------------------------------------------------------------------
    | Decodificar el token
    | --------------------------------------------------------------------------
    |
     */

     decode: async (token) => {

        try {
            const { _id } = jwt.verify(token, process.env.SECRET_KEY);
            const user = await User.findOne({_id, state:true});
            if(user){
                return user;
            }else {
                return false;
            }
        } catch (error) {
            //const newToken = await checkToken(token);
            return false;
        }
    }

}