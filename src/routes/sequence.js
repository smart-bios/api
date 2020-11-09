import {Router} from 'express'
import Prot from '../models/protein'
import Nucl from '../models/nucleotide'
import SeqKit from '../services/seqkit';
const ruta = Router()

/*
|--------------------------------------------------------------------------
| Buscar secuencias anotadas por texto libre
|--------------------------------------------------------------------------
*/
ruta.get('/search/:text', async(req,res)=> {
    try {
        const text = req.params.text
        const resultados = await Prot.find({ 
            $or: [
                {id : {$regex : text , $options: 'i' }},
                {desc: {$regex : text , $options: 'i' }},
                {preferred_name: {$regex : text , $options: 'i' }},
                {funcional_COG: {$regex : text , $options: 'i' }},
                {KEGG_pathway: {$regex : text , $options: 'i' }}
            ] 
            });
        if(resultados.length > 0){
            res.json({
                resultados,
                status: "success",
                message: `${resultados.length} items found`
            });
        }else{
            res.json({
                resultados,
                status: "danger",
                message: `No item was found`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: `Error buscando ${text}`
        });        
    }

});

/*
|--------------------------------------------------------------------------
| Obteber secuencia X
|--------------------------------------------------------------------------
*/
ruta.get('/:id', async(req,res)=>{

    try {
        const id = req.params.id
        const seq = await Prot.findOne({id})
        res.json({
            status: "success",
            message: `secuencia: ${id}`,
            seq
        });
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: `Error al obtener${id}`,
            error
        })
    }    
})

ruta.get('/nucl/:id', async(req,res)=>{

    try {
        const id = req.params.id
        const seq = await Nucl.findOne({id},{sequence: 1})
        res.json({
            status: "success",
            message: `secuencia: ${id}`,
            seq
        });
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: `Error al obtener${id}`,
            error
        })
    }    
})

ruta.post('/none', async(req, res) => {
    console.log('None');
    try {
        SeqKit.none(req.body, function(err, result){
            if(err) return res.json({error: err});

            res.json({
                status: "success",
                sequence: result
            });
        })
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: `Error`,
            error
        })
    }

})

ruta.post('/remove-gaps', async(req, res) => {
    console.log('Remove no coding characters');
    try {
        SeqKit.remove_gaps(req.body, function(err, result){
            if(err) return res.json({error: err});
            res.json({
                status: "success",
                sequence: result
            });
        })
        
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: `Error`,
            error
        })
    }
})
ruta.post('/reverse', async(req, res) => {
    console.log('Reverse sequence.');
    try {
        SeqKit.reverse(req.body, function(err, result){
            if(err) return res.json({error: err});
            res.json({
                status: "success",
                sequence: result
            });
        })
        
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: `Error`,
            error
        })
    }
    
})
ruta.post('/complement', async(req, res) => {
    console.log('Complement sequence.');
    try {
        SeqKit.complement(req.body, function(err, result){
            if(err) return res.json({error: err});
            res.json({
                status: "success",
                sequence: result
            });
        })
        
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: `Error`,
            error
        })
    }
    
})
ruta.post('/reverse-complement', async(req, res) => {
    console.log('Reverse and Complement sequence');
    try {
        SeqKit.reverse_complement(req.body, function(err, result){
            if(err) return res.json({error: err});
            res.json({
                status: "success",
                sequence: result
            });
        })
        
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: `Error`,
            error
        })
    }
    
})

export default ruta