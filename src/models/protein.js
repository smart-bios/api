import {Schema , model} from 'mongoose';

const proteinSchema = new Schema({

    id: {
        type: String, 
        required: [true, "El titulo es necesario"]
    },
    genome: {
        type: Schema.ObjectId, 
        ref: 'Genoma',
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
    },
    preferred_name:{
        type: String
    },
    funcional_COG:{
        type: String
    },
    GOs:{
        type: String
    },
    KEGG_ko:{
        type: String
    },
    KEGG_pathway:{
        type: String
    },
    tax_scope:{
        type: String
    },
    best_blast:{
        type: String
    }

},{
    timestamps: true
});
//proteinaSchema.index({desc: 'text', preferred_name: 'text', GOs: 'text', KEGG_pathway: 'text', KEGG_ko: 'text'});
const Protein = model('Protein',proteinSchema);

export default Protein;