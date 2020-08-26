import {Schema , model} from 'mongoose';

const referenceSchema = new Schema ({

    ref: {
        type: String
    },
    taxonomy: {
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

const Reference = model('Referencia',referenceSchema);

export default Reference;