import {Schema, model} from 'mongoose'


const roles = {
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE}, rol no valido'
}

const userSchema = new Schema({

    username: {
        type: String,
        required: [true, "El nombre es necesario"]
    },
    email: {
        type: String,
        required: [true, "El email es necesario"],
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: roles
    },
    state: {
        type: Boolean,
        default: true
    }
},{
    timestamps: true
});

const User = model('User',userSchema);

export default User;