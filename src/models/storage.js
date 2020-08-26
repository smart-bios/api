import {Schema, model} from 'mongoose'

const storageSchema = new Schema({

    user: {
        type: Schema.ObjectId, 
        ref: 'User',
    },

    filename: {
        type: String
    },

    path: {
        type: String
    },

    description: {
        type: String
    },

    category: {
        type: String,
        enum: ["fastq", "fasta", "csv"]
    },

    type:{
        type: String,
        default: "uploaded",
        enum: ['uploaded', 'result']
    }

},{
    timestamps: true
});

const Storage = model('Storage', storageSchema);

export default Storage;