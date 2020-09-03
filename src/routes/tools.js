
import { Router } from 'express'; 
import tools from '../services/biotools';
import storage from '../models/storage';

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
| In silico PCR
|--------------------------------------------------------------------------
*/

ruta.post('/in_silico_pcr', (req, res) => {

    let params = {
        input: `/srv/ftp/Pseudomonas/${req.body.seq}/${req.body.seq}${req.body.target}`,
        forward: req.body.forward,
        reverse: req.body.reverse
    }

    try {
        tools.in_silico_pcr(params, function(err, result, amplicons){
            if(err){
                return res.json({error: err});
            }
            res.json({
                status: 'success',
                result,
                amplicons
            }) 
         })
        
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
});

/*
|--------------------------------------------------------------------------
| trim galore
|--------------------------------------------------------------------------
*/
ruta.post('/trimgalore', async(req, res) => {

    try {
        tools.trimgalore(req.body, function(err, result){
            if(err){
                res.json({ status: 'failed', message: 'Trim Galore failed', err})
            }

            let trim_reads = []
            req.body.paired ? trim_reads = [result.trim1, result.trim2] : trim_reads = [result.trim1] 
            storage.insertMany(trim_reads, function(err, data){
                if(err){
                    res.json({
                        status: 'failed',
                        message: 'Trim Galore failed',
                        error: err
                    })
                }
                if(req.body.paired){
                    res.json({
                        status: 'success',
                        message: 'Trim Galore complete',
                        fq1 : {
                            filename: result.trim1.filename,
                            path: result.trim1.path,
                            path_report: result.trim1.report,
                            report: result.reportfq1
                        },
                        fq2 : {
                            filename: result.trim2.filename,
                            path: result.trim2.path,
                            path_report: result.trim2.report,
                            report: result.reportfq2
                        }
                    }) 
                }else{
                    res.json({
                        status: 'success',
                        message: 'Trim Galore complete',
                        fq1 : {
                            filename: result.trim1.filename,
                            path: result.trim1.path,
                            path_report: result.trim1.report,
                            report: result.reportfq1
                        },
                        fq2: ''
                    }) 
                }
                
            })
               
        })
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            error
        })
    }
})

/*
|--------------------------------------------------------------------------
| Unicycle
|--------------------------------------------------------------------------
*/

ruta.post('/unicycler', async(req, res)=> {
    try {
        tools.unicycler(req.body, function(err, result){
            if(err){
                res.json({ status: 'failed',message: 'Assembly failed',error: err})
            }
            storage.create(result, function(err, file){
                if(err){
                    res.json({
                        status: 'failed',
                        message: 'Assembly failed',
                        error: err
                    })
                }
                res.json({
                    status: 'success',
                    message: 'Unicycler assembly complete ',
                    result: file._id
                })
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