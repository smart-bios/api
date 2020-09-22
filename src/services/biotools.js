import { spawn } from 'child_process';
import path from 'path';
import compress from 'zip-a-folder'
import os from 'os'
import fs from 'fs'
import parse from './parse'

const home = os.homedir()
const databasesRoot = path.join(home,'databases');
const prokka = '/opt/biotools/prokka/bin/prokka';
const dfast = '/opt/biotools/dfast_core/dfast'
const eggNOG = '/opt/biotools/eggnog-mapper/emapper.py';
const ssrPrimers = '/opt/biotools/SSRMMD/connectorToPrimer3/connectorToPrimer3.pl'
const threads = process.env.THREADS


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
        const blastcmd = spawn(`${input.type_blast}`, ['-db', database, '-num_threads', threads, '-outfmt', outfmt])

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
        let file_name = path.basename(input.fq).split('.');
       
        const cmd_fastqc = spawn('fastqc',['-t', 2, '-o', output, '--extract', fq])

        cmd_fastqc.stderr.on('data', (data) => {console.log(data.toString())});
       
        cmd_fastqc.on('close', (code) => {
           console.log(`fastqc process exited with code ${code}`);
            if(code == 0){
                let basic   = parse.parseFastqData(`${output}/${file_name[0]}_fastqc/fastqc_data.txt`)
                let summary = parse.parseSummary(`${output}/${file_name[0]}_fastqc/summary.txt`)
                let report  = `storage/${input.user}/tmp/${file_name[0]}_fastqc.zip`

                return cb(null, {
                    basic,
                    summary,
                    report
                })

            }else{
                return cb('ERROR FASTQC', null)
            }            
        })
    },

    /*
    |--------------------------------------------------------------------------
    | Fastp
    |--------------------------------------------------------------------------
    */
   fastp: (input, cb) => {
       let fq1 = path.join(__dirname, `../../${input.fq1}`)
       let fq2 = path.join(__dirname, `../../${input.fq2}`)
       let output = path.join(__dirname, `../../storage/${input.user}/tmp/`)
       let parametros = ['-i', fq1, '-I', fq2, '-o', `${output}${input.name}_R1_good.fq.gz`, '-O', `${output}${input.name}_R2_good.fq.gz`, '-l', input.length, '-q', input.quality, '-j', `${input.name}.json`, '-h', `${input.name}.html`, '-w', threads]
        
       console.log('runnig fastp')
       let cmd_fastp = spawn('fastp', parametros);

       cmd_fastp.on('exit', (code) => {
           console.log(`fastp process exited with code ${code}`);
           if(code == 0){
               return cb (null, parametros)
           }else{
               return('ERROR FASTP', null)
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
            return cb('ERROR TRIM GALORE', null)
        })       
    },

    /*
    |--------------------------------------------------------------------------
    | Unicycler - Ensamblaje de de novo para bacterias
    |--------------------------------------------------------------------------
    */
    unicycler: (input, cb) =>{
        console.log(input)
        let fq1 =  path.join(__dirname, `../../${input.fq1}`)
        let fq2 =  path.join(__dirname, `../../${input.fq2}`)
        let length = input.length_fasta
        let output = path.join(__dirname, `../../storage/${input.user.id}/tmp/${input.name}`)
        let zip = `${output}.zip`

        const cmd_unicycler = spawn('unicycler',['-1', fq1, '-2', fq2,'--mode', input.mode, '--min_fasta_length', length, '-t', threads,'-o', output,'--spades_path', '/opt/biotools/SPAdes-3.13.0-Linux/bin/spades.py'])
        cmd_unicycler.stderr.on('data', (data) => {console.log(data.toString())});
        cmd_unicycler.stdout.on('data', (data) => {console.log(data.toString())});

        cmd_unicycler.on('close', (code) => {
            console.log(`unicycler process exited with code ${code}`);
            if(code == 0){
                compress.zipFolder(output, zip, function(err){
                    if(err){
                        return cb(err, null)
                    }

                    let result = {
                        user: `${input.user.id}`,
                        filename: `${input.name}.zip`,
                        path: `storage/${input.user.id}/tmp/${input.name}.zip`,
                        description: `Unicycler result`,
                        type: 'result'
                    }

                    let assembly = {
                        user: `${input.user.id}`,
                        filename: `${input.name}_assembly.fasta`,
                        path: `storage/${input.user.id}/tmp/${input.name}/assembly.fasta`,
                        description: `Unicycler Assembly`,
                        category: 'fasta',
                        type: 'result'
                    }
                    
                    return cb(null, {
                        result,
                        assembly,
                        file: `${output}.zip`
                    }
                    )
                })
            }else{
                    return cb('ERROR UNICYCLER', null)
            }            
        })
    },

    /*
    |--------------------------------------------------------------------------
    |QUAST
    |--------------------------------------------------------------------------
    */
    quast: (input, cb) => {
        let assembly = path.join(__dirname, `../../${input.assembly}`)
        let output = path.join(__dirname, `../../storage/${input.user}/tmp/quast/${input.name}`);
        let parametros = ['-m', input.length, '--contig-thresholds', input.thresholds, '-t', threads, '-o', output, '--no-html','--no-icarus', '--plots-format', 'png']

        if(input.compare){
            let reference = `${path.join(home, input.reference)}_genomic.fna`
            let anotation = `${path.join(home, input.reference)}_genomic.gff`
            parametros = parametros.concat(['-r', reference, '-g', anotation, assembly])
        }else {
            parametros.push(assembly)
        }

        let cmd_quast = spawn('quast.py', parametros)
        
        cmd_quast.stdout.on('data', (data) => {console.log(data.toString())})

        cmd_quast.on('close', (code) => {
            console.log(`Quast process exited with code ${code}`);
            if(code == 0){
                compress.zipFolder(output, `${output}.zip`, function(err){
                    if(err){return cb('Error comprimir archivo', null)}

                    let result = {
                        user: `${input.user}`,
                        filename: `${input.name}.zip`,
                        path: `storage/${input.user}/tmp/quast/${input.name}.zip`,
                        description: 'Quast result',
                        type: 'result'
                    }

                    if (fs.existsSync(`${output}/contigs_reports/unaligned_report.tsv`)) {
                        return cb(null, {
                            result,
                            report: `${output}/report.tsv`,
                            unaligned: `${output}/contigs_reports/unaligned_report.tsv`
                        })
                    }else{
                        return cb(null, {
                            result,
                            report: `${output}/report.tsv`,
                            unaligned: null
                        })
                    }
                      
                    
                })
            }else{
                    return cb('ERROR QUAST', null)
            }  
        })        
    },

    /*
    |--------------------------------------------------------------------------
    |BUSCO
    |--------------------------------------------------------------------------
    */
    busco: (input, cb) => {
        let fasta = path.join(__dirname, `../../${input.fasta}`) 
        let lineage = path.join(databasesRoot, `/busco/${input.lineage}`)
        let output = path.join(__dirname, `../../storage/${input.user}/tmp/`);
        let config = '/opt/biotools/busco/config/config.ini'
        let parametros = ['-i', fasta, '-o', input.name, '--out_path', output, '-l', lineage, '-m', input.mode, '-c', threads, '--config', config, '--offline', '-f']

        let cmd_busco = spawn('busco', parametros)
        cmd_busco.stderr.on('data', (data) => {console.log(data.toString())});
        cmd_busco.stdout.on('data', (data) => {console.log(data.toString())});

        cmd_busco.on('close', (code) => {
            console.log(`BUSCO process exited with code ${code}`);
            if(code == 0){
                compress.zipFolder(`${output}/${input.name}`,`${output}/${input.name}.zip`, function(err){

                    let result = {
                        user: `${input.user}`,
                        filename: `${input.name}.zip`,
                        path: `storage/${input.user}/tmp/${input.name}.zip`,
                        description: 'BUSCO result',
                        type: 'result'
                    }

                    return cb(null, {
                        result,
                        report: `${output}/${input.name}/short_summary.specific.${input.lineage}.${input.name}.txt`
                    })
                })
                
            }else{
                return cb('ERROR BUSCO', null)
            }
        })
    },

    /*
    |--------------------------------------------------------------------------
    |PROKKA
    |--------------------------------------------------------------------------
    */
    prokka: (input, cb) =>{
        let fasta = path.join(__dirname, `../../${input.fasta_file}`)
        let output = path.join(__dirname, `../../storage/${input.user}/tmp/prokka/${input.name}`);
        let parametros = ['-outdir', output, '--prefix', input.name, '--locustag', input.locustag, '--kingdom', input.kingdom, '--genus', input.genus, '--species', input.species, '--strain', input.strain, '--plasmid', input.plasmid, '--cpus', threads,'--force', fasta ] 
        let cmd_pokka = spawn(prokka, parametros);
        cmd_pokka.stderr.on('data', (data) => {console.log(data.toString())});
        cmd_pokka.on('close', (code) => {
            console.log(`prokka process exited with code ${code}`);
            
            if(code == 0){
                compress.zipFolder(output, `${output}.zip`, function(err){
                    if(err){
                        return cb(err, null)
                    }
    
                    let result = {
                        user: `${input.user}`,
                        filename: `${input.name}.zip`,
                        path: `storage/${input.user}/tmp/prokka/${input.name}.zip`,
                        description: 'Prokka result',
                        type: 'result'
                    }
                    
                    return cb(null,{
                        result,
                        report: `${output}/${input.name}.txt`
                    })
                })
            }else{
                return cb('ERROR PROKKA', null)
            }
        })
    
    },

    /*
    |--------------------------------------------------------------------------
    |Dfast
    |--------------------------------------------------------------------------
    */
    dfast: (input, cb) => {
        let fasta = path.join(__dirname, `../../${input.fasta_file}`)
        let output = path.join(__dirname, `../../storage/${input.user}/tmp/${input.name}`);
        let parametros = ['--genome', fasta, '--organism', input.organism, '--strain', input.strain, '--locus_tag_prefix', input.locustag, '--cpu', threads, '--force', '--out', output]
        let cmd_dfast = spawn(dfast, parametros);
        cmd_dfast.stdout.on('data', (data) => {console.log(data.toString())});

        cmd_dfast.on('close', (code) => {
            console.log(`dfast process exited with code ${code}`);
            
            if(code == 0){
                compress.zipFolder(output, `${output}.zip`, function(err){
                    if(err){
                        return cb(err, null)
                    }
    
                    let result = {
                        user: `${input.user}`,
                        filename: `${input.name}.zip`,
                        path: `storage/${input.user}/tmp/${input.name}.zip`,
                        description: 'Dfast result',
                        type: 'result'
                    }
                    
                    return cb(null,{
                        result,
                        report: `${output}/statistics.txt`
                    })
                })
            }else{
                return cb('ERROR Dfast', null)
            }
        })

        
    },

    /*
    |--------------------------------------------------------------------------
    |eggNOG
    |--------------------------------------------------------------------------
    */
    eggNOG: (input, cb) => {
        let database = `${databasesRoot}/eggNOG/`
        let fasta = path.join(__dirname, `../../${input.fasta}`)
        let output = path.join(__dirname, `../../storage/${input.user}/tmp/`);
        let parametros = ['-i', fasta, '-o', input.name, '--output_dir', output, '--data_dir', database, '--tax_scope', input.tax_scope, '--target_orthologs', input.ortho, '-m', 'diamond', '--cpu', threads]
        input.translate ? parametros.push('--translate') : console.log('protein sequences')

        let cmd_eggNOG = spawn(eggNOG, parametros);
        cmd_eggNOG.stderr.on('data', (data) => {console.log(data.toString())});
        cmd_eggNOG.on('close', (code) => {
            console.log(`eggNOG process exited with code ${code}`);
            
            if(code == 0){
                let report = `${output}/${input.name}.emapper.annotations`
                let annotations  = `storage/${input.user}/tmp/${input.name}.emapper.annotations`
                let orthologs = `storage/${input.user}/tmp/${input.name}.emapper.seed_orthologs` 
                return cb(null, {
                    report,
                    annotations,
                    orthologs
                })
            }else{
                return cb('ERROR eggNOG', null)
            }

        })
        
        
    },

    /*
    |--------------------------------------------------------------------------
    |PERF
    |--------------------------------------------------------------------------
    */
    perf: (input, cb) =>{
        let fasta =  path.join(__dirname, `../../${input.fasta}`)
        let minimum = input.minimum
        let maximum = input.maximum
        let length = input.length
        let file_name = path.basename(fasta).split('.');
        let tsv = path.join(__dirname, `../../storage/${input.user}/${file_name[0]}_perf.tsv`)

        const cmd_perf = spawn('PERF', ['-i', fasta, '-m', minimum, '-M', maximum, '-l', length, '-a', '-t', 4])
        cmd_perf.stdout.on('data', (data) => {console.log(data.toString())});
        
        cmd_perf.on('close', (code)=> {
            console.log(`PERF process exited with code ${code}`);
            if(code == 0){
                let report = parse.parsePerf(tsv)
                return cb(null, {
                    html: `storage/${input.user}/${file_name[0]}_perf.html`,
                    tsv: `storage/${input.user}/${file_name[0]}_perf.tsv`,
                    report
                })
            }else{
                return cb('ERROR PERF', null)
            }
            
        })

    },

    /*
    |--------------------------------------------------------------------------
    |SRRMMD
    |--------------------------------------------------------------------------
    */
    ssrmmd: (input, cb) => {
        let fasta1 =  path.join(__dirname, `../../${input.f1}`)
        let fasta2 =  path.join(__dirname, `../../${input.f2}`)
        let output = path.join(__dirname, `../../storage/${input.user}/tmp/${input.name}`);
        let parametros = ['-f1', fasta1, '-p', input.poly, '-o', output, '-ss', 1,'-t', threads, '-mo', input.motif, '-minLen', input.minLen, '-maxLen', input.maxLen, '-length', input.length]
        let basename1 = path.basename(fasta1)
        let basename2 = path.basename(fasta2)

        input.poly == 1 ? parametros = ['-f1', fasta1, '-f2', fasta2, '-p', input.poly, '-o', output, '-ss', 1,'-t', threads, '-mo', input.motif, '-minLen', input.minLen, '-maxLen', input.maxLen, '-length', input.length]  : console.log('es 0')
        
        const cmd_ssrmmd = spawn('SSRMMD.pl', parametros)
        cmd_ssrmmd.stdout.on('data', (data) => {console.log(data.toString())});
        cmd_ssrmmd.stderr.on('data', (data) => {console.log(data.toString())});
        cmd_ssrmmd.on('close', (code)=> {
            console.log(`SSRMMD process exited with code ${code}`);
            if(code == 0){

                if(input.poly == 1){
                    let ssr_result1 = `${output}/${basename1}.SSRs`
                    let ssr_result2 = `${output}/${basename2}.SSRs`
                    let stat1 = `${output}/${basename1}.stat`
                    let stat2 = `${output}/${basename2}.stat`
                    let primers_result = `${output}/primers.txt`
                    let compare = `${output}/${basename1}-and-${basename2}.compare`
                    let primers = spawn(ssrPrimers,['-i', compare, '-s', 2, '-o', primers_result])
                    primers.on('close', (code) =>{
                        console.log(`PRIMERS process exited with code ${code}`);
                        if(code == 0){
                            return cb(null,{
                                ssr_result1,
                                ssr_result2,
                                stat1,
                                stat2,
                                compare,
                                primers_result
                            })
                        }else{
                            return cb('ERROR GENERAR PRIMERS', null)
                        }
                    })   
                }else{
                    let ssr_result1 = `${output}/${basename1}.SSRs`
                    let primers_result = `${output}/${input.name}_primers.tsv`
                    let primers = spawn(ssrPrimers,['-i', ssr_result1, '-o', primers_result])
                    primers.on('close', (code) =>{
                        console.log(`PRIMERS process exited with code ${code}`);
                        if(code == 0){
                            return cb(null, {
                                report: ssr_result1,
                                path_ssr: `storage/${input.user}/tmp/${input.name}/${basename1}.SSRs`,
                                path_stat: `storage/${input.user}/tmp/${input.name}/${basename1}.stat`,
                                primers_result: `storage/${input.user}/tmp/${input.name}/${input.name}_primers.tsv`
                            })
                        }else{
                            return cb('ERROR GENERAR PRIMERS', null)
                        }
                    })  

                }
            }else{
                return cb('NO SE ENCONTRARON SSR', null)
            }        
        })
        
    }


}