import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os'

const home = os.homedir()
const databasesRoot = path.join(home,'databases');
const threads = 4

function parseSummary(summary){
    let data = fs.readFileSync(summary,'utf8')
    let headers = ['status','module','library']
    let sumary = tsv2JsonNoHead(data, headers)
    return sumary.splice(1)
}

function parseFastqData(fastqc_data){
    let data = fs.readFileSync(fastqc_data,'utf8')
    let lines = data.split('\n')
    let headers = ['measure','value']
    let statistics = lines.slice(3,10)
    return statistics.map(line => {
        let data = line.split('\t');
        return headers.reduce((obj, nextKey, index) => {
            obj[nextKey] = data[index];
            return obj;
        }, {});
    })
}
function tsv2JsonNoHead(tsv, headers){
    let lines = tsv.split('\n');
    return lines.map(line => {
        let data = line.split('\t');
        return headers.reduce((obj, nextKey, index) => {
            obj[nextKey] = data[index];
            return obj;
        }, {});
    })
}

function tsv2Json(tsv){
    let lines = tsv.split('\n');
    let headers = lines.shift().split('\t');
    return lines.map(line => {
        let data = line.split('\t');
        return headers.reduce((obj, nextKey, index) => {
            obj[nextKey] = data[index];
            return obj;
        }, {});
    })
}

function getPaths(user, project_name){
    let user_dir = path.join(__dirname, `../../storage/${user}`)
    let project_dir =  `${user_dir}/tmp/${project_name}`
    let paths = {
        user_dir,
        project_dir,
    }
    return  paths
}
export default {

    /*
    |--------------------------------------------------------------------------
    | Blast
    |--------------------------------------------------------------------------
    */
    blast: (input, cb) => {
        
        let database = path.join(databasesRoot, input.database)
        console.log(`Database: ${database}`)
        let outfmt = "6 qseqid qlen sseqid slen stitle pident qcovs length mismatch gapopen evalue bitscore"
        let headers = ['qseqid', 'qlen', 'sseqid', 'slen','stitle', 'pident', 'qcovs','length', 'mismatch', 'gapopen', 'evalue', 'bitscore']         
        let result = ''

        const seq = spawn('echo',[`${input.query}`])
        const blastcmd = spawn(`${input.type_blast}`, ['-db', `${database}`, '-num_threads', 4, '-outfmt', `${outfmt}`])

        seq.stdout.on('data', (data) => { blastcmd.stdin.write(data)});
        seq.stderr.on('data', (data) => { console.error(`stderr seq: ${data}`);});
        seq.on('close', (code) => {
            if (code !== 0) {console.log(`echo process exited with code ${code}`);}
            blastcmd.stdin.end();
        });
        
        blastcmd.stdout.on('data', (data) => { result += data.toString();});    
        blastcmd.stderr.on('data', (data) => { console.error(`blastcmd stderr: ${data}`);});
        
        blastcmd.on('close', (code) => {
            console.log(`blastcmd process exited with code ${code}`);
            let result_obj = tsv2JsonNoHead(result, headers)
            return cb(null, result_obj);
        });

    },
    /*
    |--------------------------------------------------------------------------
    | in silico PCR
    |--------------------------------------------------------------------------
    */
    in_silico_pcr: (input, cb) => {
        let pcr = '';
        let amplicon = '';
        const cmd = spawn('in_silico_PCR.pl', ['-s', `${input.input}` ,'-a',`${input.forward}`,'-b',`${input.reverse}`]);
        cmd.stdout.on('data', (data) => {
            pcr += data.toString();
        })
        cmd.stderr.on('data', (data) => {
            amplicon += data.toString();
        })
    
        cmd.on('close', (code) => {
            console.log(`insilico_pcr process exited with code ${code}`);
            let result = tsv2Json(pcr)
            return cb(null, result, amplicon)
        })
    },


    /*
    |--------------------------------------------------------------------------
    | Fastqc
    |--------------------------------------------------------------------------
    */
    fastqc: (input, cb) => {
        let url = getPaths(input.user, input.name);

        let fq =  path.join(__dirname, `../../${input.fq}`);
        let output = url.user_dir;
        let basemame = path.basename(input.fq, '.fastq.gz');
       
        const cmd_fastqc = spawn('fastqc',['-t', 2, '-o', output, '--extract', fq])

        cmd_fastqc.stderr.on('data', (data) => {console.log(data.toString())});
       
        cmd_fastqc.on('close', (code) => {
           console.log(`fastqc process exited with code ${code}`);
            if(code == 0){
                let basic = parseFastqData(`${output}/${basemame}_fastqc/fastqc_data.txt`)
                let summary = parseSummary(`${output}/${basemame}_fastqc/summary.txt`)
                return cb(null, {
                    basic,
                    summary
                })

            }else{
                return cb(err, null, null)
            }            
        })
    },

    /*
    |--------------------------------------------------------------------------
    | Trin Galore
    |--------------------------------------------------------------------------
    */

    trimgalore: (input, cb) => {

        let url = getPaths(input.user, input.name)
        let cmd_trim = ''
        
        if(input.paired){
            let fq1 =  path.join(__dirname, `../../${input.fq1}`)
            let fq2 =  path.join(__dirname, `../../${input.fq2}`)
            cmd_trim = spawn('trim_galore',['-q', input.quality, '--length', input.length, '-o', url.project_dir, '--core', threads, '--basename',input.name,'--paired', fq1, fq2])

        }else{
            let fq1 =  path.join(__dirname, `../../${input.fq1}`)
            cmd_trim = spawn('trim_galore',['-q', input.quality, '--length', input.length, '-o', url.project_dir, '--core', threads, '--basename', input.name, fq1])
   
        }

        //cmd_trim.stdout.on('data', (data) => {console.log(data.toString())});
        cmd_trim.stderr.on('data', (data) => {console.log(data.toString())});
        cmd_trim.on('close', (code) => {
            console.log(`trim_galore process exited with code ${code}`);
            if( code == 0){
                if(input.paired){
                    let trim1 = {
                        user: input.user,
                        filename: `${input.name}_val_1.fq.gz`,
                        description: 'Trin Galore result',
                        path: `storage/${input.user}/${input.name}/${input.name}_val_1.fq.gz`,
                        category: 'fastq'
                    }
                    let trim2 = {
                        user: input.user,
                        filename: `${input.name}_val_2.fq.gz`,    
                        description: 'Trin Galore result',
                        path: `storage/${input.user}/${input.name}/${input.name}_val_2.fq.gz`,
                        category: 'fastq'
                    }
                    return cb(null, {trim1, trim2})
                }else{
                    let trim1 = {
                        user: input.user,
                        filename: `${input.name}_trimmed.fq.gz`,
                        description: 'Trin Galore result',
                        path: `storage/${input.user}/${input.name}/${input.name}_trimmed.fq.gz`,
                        category: 'fastq'

                    }
                    return cb(null, trim1)
                }
               
            }
            return cb('error trim galore', null)
        })
        

       
    }
}