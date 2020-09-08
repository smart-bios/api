import {Router} from 'express'
import Genoma from '../models/genome'
import Ref from '../models/reference'

const ruta = Router()

/*
|--------------------------------------------------------------------------
| agregar genoma
|--------------------------------------------------------------------------
*/
ruta.post('/add', async(req,res)=> {
    try {
        let genoma = await Genoma.create(req.body)
        res.json({
            status: 'success',
            message: 'genoma registrado en la base de datos',
            genoma
        });
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'No se a podido registrar la muestra',
            error
        });
        
    }
});

/*
|--------------------------------------------------------------------------
| Listar todo los genomas
|--------------------------------------------------------------------------
*/
ruta.get('/list', async(req,res)=> {
    try {
        const genomas = await Genoma.find({})
        //.populate("aislamiento",{codigo: 1}) 
            res.json({
                genomas,
                status: "success"
            })
       } catch (error) {
        res.status(500).json({
            status: "failed",
            message: `Error buscando`
        })      
    }
});

/*
|--------------------------------------------------------------------------
| Listar referencias
|--------------------------------------------------------------------------
*/
ruta.get('/ref', async(req, res)=> {
    try {
        const ref = await Ref.find({})
        res.json({
            ref,
            status: "success"
        })
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: `Error list references`
        })      
    }
});

/*
|--------------------------------------------------------------------------
| buscar genoma por tipo
|--------------------------------------------------------------------------
*/
ruta.get('/search/:tipo', async(req,res)=> {
    try {
        const tipo = req.params.tipo
        const genomas = await Genoma.find({ tipo })  
            res.json({
                genomas,
                status: "success"
            })

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: `Error buscando`
        })
    }
});

/*
|--------------------------------------------------------------------------
| Buscar un genoma
|--------------------------------------------------------------------------
*/
ruta.get('/:id', async(req, res)=> {
    try {
        const _id = req.params.id
        const genoma = await Genoma.findOne({_id})
        //.populate("aislamiento")
        res.json({
            status: "success",
            genoma
        })
    } catch (error) {
        res.status(500).json({
            status: "failed",
            error
        })
        
    }
});




export default ruta