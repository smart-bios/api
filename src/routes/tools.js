
import { Router } from 'express'; 
import tools from '../services/biotools';
import storage from '../models/storage';
import csv from 'csv-parser';
import fs from 'fs';
import email from '../services/email'



const ruta = Router();

/* const transporter = nodemailer.createTransport({
    pool: true,
    host: 'mail.cancerbacteriano.cl',
    port: 465,
    secure: true,
    auth: {
        user: 'redgenomica@cancerbacteriano.cl',
        pass: 'inia.2019'
    },
    tls: {
        rejectUnauthorized: false

    }
}) */

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

ruta.post('/ssr', (req, res)=>{
    
    if(req.files){
        let sampleFile = req.files.file;
        let path_file = `/tmp/${sampleFile.name}` 

        sampleFile.mv(path_file, function(err) {
            if (err) return res.json({err});

            let input = {
                name : path_file,
                mono: req.body.mono,
                di: req.body.di,
                tri: req.body.tri,
                tetra: req.body.tetra,
                penta: req.body.penta,
                hexa: req.body.hexa,
                hepta: req.body.hepta
            }

            tools.perf(input, function(err, result){
                if(err){
                    res.json({ status: 'danger', message: err})
                }else{
                    let report = []
                    let headers = ['Chromosome','Repeat Start','Repeat Stop', 'Repeat Class', 'Repeat Length', 'Repeat Strand', 'Motif Number', 'Actual Repeat']
                    fs.createReadStream(result.tsv)
                    .pipe(csv({ separator: '\t', headers }))
                    .on('data', (data) => report.push(data))
                    .on('end', () => {
                        res.json({
                            status: 'success',
                            message: 'PERF complete',
                            report,
                            tsv: result.tsv,
                            html: result.html
                        })
                    });
            }
            })
        });
    }else{
        
        tools.perf(req.body, function(err, result){
            let report = []
            let headers = ['Chromosome','Repeat Start','Repeat Stop', 'Repeat Class', 'Repeat Length', 'Repeat Strand', 'Motif Number', 'Actual Repeat']

            if(err){
                res.json({status: 'danger', message: err})
            }else{
                fs.createReadStream(result.tsv)
                .pipe(csv({ separator: '\t', headers }))
                .on('data', (data) => report.push(data))
                .on('end', () => {
                    res.json({
                        status: 'success',
                        message: 'PERF complete',
                        report,
                        tsv: result.tsv,
                        html: result.html
                    })
                });
            }
        })
        
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
                    status: 'danger',
                    message: err
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
            status: 'danger',
            error
        }); 
    }
});

/*
|--------------------------------------------------------------------------
| fastp
|--------------------------------------------------------------------------
*/
ruta.post('/fastp', async(req, res) => {
    
    tools.fastp(req.body, function(err, result){
        if(err){
            res.json({status: 'danger', message: err})
        }else{
            res.json({
                status: 'success',
                message: 'Fasp complete',
                result
            })
        }
    })
    
})

/*
|--------------------------------------------------------------------------
| BBDuk
|--------------------------------------------------------------------------
*/
ruta.post('/bbduk', async(req, res) => {
    
    tools.bbduk(req.body, function(err, result){
        if(err){
            res.json({status: 'danger', message: err})
        }else{
            storage.insertMany([result.trim1, result.trim2], function(err, data){
                if(err){
                    res.json({status: 'danger', message: err})
                }

                res.json({
                    status: 'success',
                    message: 'BBDuk complete',
                    result: {
                        trim1: data[0]._id,
                        trim2: data[1]._id,
                        log: result.log
                    }
                })
            })
            
        }
    })
    
})


/*
|--------------------------------------------------------------------------
| trim galore
|--------------------------------------------------------------------------
*/
ruta.post('/trimgalore', async(req, res) => {

    try {
        tools.trimgalore(req.body, function(err, result){
            if(err){
                res.json({ status: 'danger', message: err })
            }else{
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

            }               
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
                res.json({ status: 'danger', message: err})
            }else{
                
                let msj = {
                    to: req.body.user.email, 
                    subject: 'Resultados ensamble UNICYCLE', 
                    text: 'prueba de correo, adjuntando resultados de ensamble con UNICYCLE', 
                    attachments: result.file
                }

                email.sendEmail(msj, function(err, info){
                    if(err) console.log(err)
                    
                    console.log(info)
                })

                storage.insertMany([result.assembly, result.result], function(err, file){
                    
                    if(err){
                        res.json({
                            status: 'danger',
                            message: 'UNICYCLER FAILED',
                        })
                    }

                    res.json({
                        status: 'success',
                        message: 'Unicycler assembly complete ',
                        result: file[1]._id
                    })
                })
            }
            
        })
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            error
        });  
    }
})

/*
|--------------------------------------------------------------------------
| QUAST
|--------------------------------------------------------------------------
*/
ruta.post('/quast', async(req, res) => {

    tools.quast(req.body, function(err, result){

        if(err){
            res.json({ status: 'danger',message: err})
        }else{
            let quast_report = []
            let unaligned_report = []
            let msj = {
                to: req.body.user.email, 
                subject: 'Resultados QUAST', 
                text: 'prueba de correo, adjuntando resultados de QUAST', 
                attachments: result.file
            }

            email.sendEmail(msj, function(err, info){
                if(err) console.log(err)
                console.log(info)
            })
            
            storage.create(result.result, function(err, file){
                if(err){
                    res.json({
                        status: 'danger',
                        message: err
                    })
                }

                fs.createReadStream(result.report)
                .pipe(csv({ separator: '\t', headers: ['item','value'] }))
                .on('data', (data) => quast_report.push(data))
                .on('end', () => {
                    if(result.unaligned != null){
                        fs.createReadStream(result.unaligned)
                        .pipe(csv({ separator: '\t', headers: ['item','value'] }))
                        .on('data', (data) => unaligned_report.push(data))
                        .on('end', () => {
                            res.json({
                                status: 'success',
                                message: 'Quast complete',
                                report: quast_report,
                                unaligned: unaligned_report,
                                result: file._id
                            })
                        });
                    }else{
                        res.json({
                            status: 'success',
                            message: 'Quast complete',
                            report: quast_report,
                            unaligned: null,
                            result: file._id
                        })
                    } 
                });
            })  
        }
    })
})

/*
|--------------------------------------------------------------------------
| BUSCO
|--------------------------------------------------------------------------
*/
ruta.post('/busco', async(req, res) => {

    tools.busco(req.body, function(err, result){
        if(err){
            res.json({ status: 'danger', message: err})
        }else{

            let msj = {
                to: req.body.user.email, 
                subject: 'Resultados análisis BUSCO', 
                text: 'prueba de correo, adjuntando resultados de BUSCO', 
                attachments: result.file
            }

            email.sendEmail(msj, function(err, info){
                if(err) console.log(err)              
                console.log(info)
            })
            storage.create(result.result, function(err, file){
                if(err){
                    res.json({ status: 'danger', message: err})
                }
                
                let data = fs.readFileSync(result.report,'utf8')
                let lines = data.split('\n')
    
                res.json({
                    status: 'success',
                    message: 'BUSCO complete',
                    report: lines,
                    result: file._id
                })
            })
        }

        

    })

    
})

/*
|--------------------------------------------------------------------------
| PROKKA
|--------------------------------------------------------------------------
*/
ruta.post('/prokka', async(req, res) => {
    tools.prokka(req.body, function(err, result){

        if(err){
            res.json({ status: 'danger', message: err})
        }else{

            let msj = {
                to: req.body.user.email, 
                subject: 'Resultados PROKKA', 
                text: 'prueba de correo, adjuntando resultados de PROKKA', 
                attachments: result.file
            }

            email.sendEmail(msj, function(err, info){
                if(err) console.log(err)
                
                console.log(info)
            })

            storage.create(result.result, function(err, file){
                if(err){
                    res.json({
                        status: 'danger',
                        message: 'Prokka failed',
                        error: err
                    })
                }
                let data = fs.readFileSync(result.report,'utf8')
                let lines = data.split('\n')
    
                res.json({
                    status: 'success',
                    message: 'Prokka complete',
                    result: file._id,
                    report: lines
                })
    
            })
        }     
    })
    
})

/*
|--------------------------------------------------------------------------
| Dfast
|--------------------------------------------------------------------------
*/
ruta.post('/dfast', async(req, res)=> {

    tools.dfast(req.body, function(err, result){
        if(err){
            res.json({ status: 'danger', message: err})
        }else{

            let msj = {
                to: req.body.user.email, 
                subject: 'Resultados Dfast', 
                text: 'prueba de correo, adjuntando resultados Dfast', 
                attachments: result.file
            }

            email.sendEmail(msj, function(err, info){
                if(err) console.log(err)
                
                console.log(info)
            })

            storage.create(result.result, function(err, file){
                if(err){
                    res.json({
                        status: 'danger',
                        message: 'Dfast failed',
                        error: err
                    })
                }
                let data = fs.readFileSync(result.report,'utf8')
                let lines = data.split('\n')
    
                res.json({
                    status: 'success',
                    message: 'Dfast complete',
                    result: file._id,
                    report: lines
                })
    
            })
        }
    })
})

/*
|--------------------------------------------------------------------------
| eggNOG
|--------------------------------------------------------------------------
*/
ruta.post('/eggNOG', async(req, res) => {
    tools.eggNOG(req.body, function(err, result){
        
        if(err){
            res.json({ status: 'danger', message: err})
        }else{
            let report = []
            fs.createReadStream(result.report)
            .pipe(csv({ separator: '\t'}))
            .on('data', (data) => report.push(data))
            .on('end', () => {
                res.json({
                    status: 'success',
                    message: 'eggNOG complete',
                    report: report,
                    annotations : result.annotations,
                    orthologs: result.orthologs
                })
            });
        }

        
    })
    
})

/*
|--------------------------------------------------------------------------
| SSRMMD
|--------------------------------------------------------------------------
*/
ruta.post('/SSRMMD', async(req, res)=> {

    tools.ssrmmd(req.body, function(err, result){
        if(err){
            res.json({ status: 'danger', message: err})
        }else{
            let ssr_report = []
            fs.createReadStream(result.report)
            .pipe(csv({ separator: '\t' }))
            .on('data', (data) => ssr_report.push(data))
            .on('end', () => {
                res.json({
                    status: 'success',
                    message: 'SRRMMD complete',
                    report: ssr_report,
                    result: result.path_ssr,
                    stat: result.path_stat,
                    primers: result.primers_result

                })
            });
        }
        
    })

    
})

/*
|--------------------------------------------------------------------------
| PERF
|--------------------------------------------------------------------------
*/
ruta.post('/perf', async(req, res) => {
    try {
        tools.perf(req.body, function(err, result){
            if(err){
                res.json({ status: 'danger',message: err})
            }else{
                res.json({
                    status: 'Success',
                    message: 'PERF complete',
                    result
                })
            }
            
            
        })
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            error
        });
    }
})


export default ruta