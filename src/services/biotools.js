import { spawn } from 'child_process';
import path from 'path';
import compress from 'zip-a-folder'
import os from 'os'
import parse from './parse'

const home = os.homedir()
const databasesRoot = path.join(home,'databases');
const threads = 4


export default {

    /*
    |--------------------------------------------------------------------------
    | Blast
    |--------------------------------------------------------------------------
    */
    blast: (input, cb) => {
        
        let database = path.join(databasesRoot, input.database)
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
            let result_obj = parse.tsv2JsonNoHead(result, headers)
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
            let result = parse.tsv2Json(pcr)
            return cb(null, result, amplicon)
        })
    },


    /*
    |--------------------------------------------------------------------------
    | Fastqc
    |--------------------------------------------------------------------------
    */
    fastqc: (input, cb) => {

        let fq =  path.join(__dirname, `../../${input.fq}`);
        let output = path.join(__dirname, `../../storage/${input.user}/tmp/`);
        let basemame = path.basename(input.fq, '.fastq.gz');
       
        const cmd_fastqc = spawn('fastqc',['-t', 2, '-o', output, '--extract', fq])

        cmd_fastqc.stderr.on('data', (data) => {console.log(data.toString())});
       
        cmd_fastqc.on('close', (code) => {
           console.log(`fastqc process exited with code ${code}`);
            if(code == 0){
                let basic   = parse.parseFastqData(`${output}/${basemame}_fastqc/fastqc_data.txt`)
                let summary = parse.parseSummary(`${output}/${basemame}_fastqc/summary.txt`)
                let report  = `/storage/${input.user}/tmp/${basemame}_fastqc.zip`

                return cb(null, {
                    basic,
                    summary,
                    report
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
        let fq1 = path.join(__dirname, `../../${input.fq1}`)
        let fq2 = path.join(__dirname, `../../${input.fq2}`)
        let basename1 = path.basename(fq1)
        let basename2 = path.basename(fq2)
        let output = path.join(__dirname, `../../storage/${input.user}/tmp/trim_galore`);
        let parametros = ['-q', input.quality, '--length', input.length, '-o', output, '--core', threads, '--basename', input.name]
        
        input.paired ? parametros = parametros.concat(['--paired', fq1, fq2]) : parametros.push(fq1)
        let cmd_trim = spawn('trim_galore', parametros)
        
        cmd_trim.stdout.on('data', (data) => {console.log(data.toString())});
        cmd_trim.stderr.on('data', (data) => {console.log(data.toString())});
        cmd_trim.on('close', (code) => {
            console.log(`trim_galore process exited with code ${code}`);
            if(code == 0){

                let reportfq1 = parse.parseTrimGalore(`${output}/${basename1}_trimming_report.txt`)
                
                let trim1 = {
                    user: input.user,
                    filename: `${input.name}_val_1.fq.gz`,
                    description: 'Trin Galore result',
                    path: `storage/${input.user}/tmp/trim_galore/${input.name}_val_1.fq.gz`,
                    category: 'fastq',
                    report: `/storage/${input.user}/tmp/trim_galore/${basename1}_trimming_report.txt`
                }

                if(input.paired){
                    let trim2 = {
                        user: input.user,
                        filename: `${input.name}_val_2.fq.gz`,    
                        description: 'Trin Galore result',
                        path: `storage/${input.user}/tmp/trim_galore/${input.name}_val_2.fq.gz`,
                        category: 'fastq',
                        report: `/storage/${input.user}/tmp/trim_galore/${basename2}_trimming_report.txt`
                    }
                    let reportfq2 = parse.parseTrimGalore(`${output}/${basename2}_trimming_report.txt`)
                    return cb(null, {trim1, trim2, reportfq1, reportfq2})
                }else{
                    trim1.filename = `${input.name}_trimmed.fq.gz`, 
                    trim1.path = `storage/${input.user}/tmp/trim_galore/${input.name}_trimmed.fq.gz`
                    return cb(null, {trim1, reportfq1})
                }
            }
            return cb('error trim galore', null)
        })       
    },

    /*
    |--------------------------------------------------------------------------
    | Unicycler - Ensamblaje de de novo para bacterias
    |--------------------------------------------------------------------------
    */
    unicycler: (input, cb) =>{
        let fq1 =  path.join(__dirname, `../../${input.fq1}`)
        let fq2 =  path.join(__dirname, `../../${input.fq2}`)
        let length = input.length_fasta
        let output = path.join(__dirname, `../../storage/${input.user}/tmp/${input.name}`)
        let zip = `${output}.zip`

        const cmd_unicycler = spawn('unicycler',['-1', fq1, '-2', fq2, '--min_fasta_length', length, '-t', threads,'-o', output,'--spades_path', '/opt/biotools/SPAdes-3.13.0-Linux/bin/spades.py'])

        cmd_unicycler.on('close', (code) => {
            console.log(`unicycler process exited with code ${code}`);
            if(code == 0){
                compress.zipFolder(output, zip, function(err){
                    if(err){
                        return cb(err, null)
                    }
                    let result = {
                        user: `${input.user}`,
                        filename: `${input.name}.zip`,
                        path: `storage/${input.user}/tmp/${input.name}.zip`,
                        description: `Unicyclet result`,
                        type: 'result'
                    }
                    return cb(null, result)
                })
            }else{
                    return cb(err, null)
            }            
        })
    },
}