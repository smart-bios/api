import {Router} from 'express';
import Storage from '../models/storage'
import fs from 'fs'
import path from 'path'

const ruta = Router();
const extensions = ['fasta','faa','ffn','fna','fa','fastq','fq','gz','tsv','cvs']


/*
|--------------------------------------------------------------------------
| Upload file whith express-fileupload 
|--------------------------------------------------------------------------
*/
ruta.post('/upload', (req, res) => {

    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(406).json({
            status: 'failed',
            message: 'No files were uploaded.'
        });
    }

    let sampleFile = req.files.file;
    let file_name = sampleFile.name.split('.');
    let extension = file_name[file_name.length -1];

    if(extensions.indexOf(extension) < 0){
        res.status(400).json({
            status: 'failed',
            message: 'La extension del archivo no es valida'
        });
    }

    let upload = {
        user: req.body.id,
        filename: sampleFile.name,
        path: `storage/${req.body.id}/${sampleFile.name}`,
        description: req.body.description,
        category: req.body.category
    }
    sampleFile.mv(upload.path, function(err) {
        if (err){
            return res.status(500).json({
                status: 'failes',  
                message: 'No se pudo subier el archivo',
                err
            });
        }
        Storage.create(upload, function(err, result){
            
            res.json({
                status: 'success',
                message: 'Archivo recibido',
                result       
            });
        });
    });
})

/*
|--------------------------------------------------------------------------
| List all files 
|--------------------------------------------------------------------------
*/
ruta.get("/list/:id", async(req, res) =>{
    try {
        let _id = req.params.id;
        let result = await Storage.find({user: _id})
        res.json({
            status: 'success',
            files: result
        })
    } catch (error) {
        res.json({
            status: 'failed',
            error
        })
    }
})


/*
|--------------------------------------------------------------------------
| List files by category 
|--------------------------------------------------------------------------
*/
ruta.post("/list", async(req, res) =>{
    try {
        let result = await Storage.find({user: req.body.user, type: req.body.type})
        res.json({
            status: 'success',
            files: result
        })
    } catch (error) {
        res.json({
            status: 'failed',
            error
        })
    }
})

/*
|--------------------------------------------------------------------------
| Delete file
|--------------------------------------------------------------------------
*/

ruta.delete('/delete/:id', async(req, res) => {
    const _id = req.params.id;
    let file = await Storage.findOne({_id});
    let name = await Storage.findByIdAndDelete({_id});

    fs.unlink(file.path, (err) => {
        if (err) { 
            return res.json({
                status: 'failed',
                err
            })
        } 
        res.json({
            status: 'success',
            path: name.file_name
        })
    })    
})

/*
|--------------------------------------------------------------------------
| Download file
|--------------------------------------------------------------------------
*/

ruta.get('/download/:id', async(req, res) => {
    
    let _id = req.params.id
    Storage.findOne({_id}, function(err, file){
        if(err){
            res.status(406).json({
                status: 'failed',
                err
            });
        } 

        res.setHeader('Content-Disposition', 'attachment');
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);

        let file_path = path.join(__dirname,`../../${file.path}`)
        res.download(file_path, (err)=>{
            if(err){
                res.status(406).json({
                    status: 'failed',
                    err
                });
                
            }
            console.log('Your file has been downloaded!')

        });    
    })
})

export default ruta