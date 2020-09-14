import {Schema , model} from 'mongoose';

const databseSchema = new Schema ({

    name: {
        type: String,
        required: true
    },
    tipo: {
        types: String
    },
    path:{
        type: String,
    }
},{
    timestamps: true
});

const Database = model('Database', databaseSchema);

export default Database;