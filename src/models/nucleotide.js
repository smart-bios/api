import {Schema , model} from 'mongoose';

const nucleotideSchema = new Schema({

    id: {
        type: String, 
        required: [true, "El titulo es necesario"]
    },
    genome: {
        type: Schema.ObjectId, 
        ref: 'Genome',
        required: true
    },
    sequence: {
        type: String, 
        required: [true, "El titulo es necesario"]
    },
    legth: {
        type: Number
    },
    desc: {
        type: String
    }
},{
    timestamps: true
});
const Nucleotide = model('Nucleotide',nucleotideSchema);

export default Nucleotide;