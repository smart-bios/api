import {Schema , model} from 'mongoose';

const genomeSchema = new Schema ({

    organismo: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    tipo: {
        types: String
    },
    description:{
        type: String,
    },
    method: {
        type: String,
        default: 'Illumina PE'
    },
    version: {
        type: String,
        default: 'v1.0'
    },
    level: {
        type: String,
        default: 'contig',
        enum: ['contig','scaffold','complete']
    },
    contig: {
        type: Number,
        required: true
    },
    size: {
        type: String
    },
    cds: {
        type: String
    },
    genes: {
        type: String
    },
    rRNA: {
        type: String
    },
    tRNA: {
        type: String
    }
},{
    timestamps: true
});

const Genome = model('Genome',genomeSchema);

export default Genome;