import {Router} from 'express'
import Prot from '../models/protein'
import Nucl from '../models/nucleotide'
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

export default ruta