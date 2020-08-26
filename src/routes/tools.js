
import { Router } from 'express'; 
import tools from '../services/biotools';

const ruta = Router();

/*
|--------------------------------------------------------------------------
| blast
|--------------------------------------------------------------------------
*/

ruta.post('/blast', (req, res) =>{

    let params = {
        type_blast : req.body.type,
        query: req.body.seq,
        database: req.body.db,
        max_target_seqs: req.body.max_target_seqs
    }

    try {
        tools.blast(params, function (err, output) {
            if (err) {
              return res.json({error: err});
            } 
            res.json({
                status:'success',
                message: 'Loading..',
                blast: output
            })    
        });        
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            error
        });        
    }    
});




/*
|--------------------------------------------------------------------------
| Fastqc
|--------------------------------------------------------------------------
*/
ruta.post('/fastqc', async(req, res) => {
    try {
        tools.fastqc(req.body, function(err, result){
            if(err){
                res.json({
                    status: 'failed',
                    message: 'Fastqc failed',
                    error: err
                })
            }

            res.json({
                status: 'success',
                message: 'Fastqc complete',
                result
            })
        })
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            error
        }); 
    }
})

export default ruta