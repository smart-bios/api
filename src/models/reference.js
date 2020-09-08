import {Schema , model} from 'mongoose';

const referenceSchema = new Schema ({

    name: {
        type: String
    },
    kingdom: {
        type: String
    },
    ncbi: {
        type: String
    },
    path: {
        type: String
    },
    index: {
        type: String
    }
},{
    timestamps: true
});

const Reference = model('Reference', referenceSchema);

export default Reference;