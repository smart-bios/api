import { spawn } from 'child_process';

export default {

    none: (input, cb) => {
        
        let seq = spawn('echo',['-e', `${input.sequence}`])
        let seqkit = spawn('seqkit', ['seq', '-w', input.width, input.case])
        let result = ''

        seq.stdout.on('data', (data) => {
            seqkit.stdin.write(data)
        })
        seq.stderr.on('data', (data) => { console.error(`stderr seq: ${data}`);});
        seq.on('close', (code) => {
            console.log(`echo process exited with code ${code}`)
            seqkit.stdin.end();
        });

        seqkit.stdout.on('data', (data) => { result += data.toString();});    
        
        seqkit.on('close', (code) => {
            if(code == 0){
                console.log(`seqkit process exited with code ${code}`);
                return cb(null, result);
            }else{
                return cb('ERROR', null)
            }
            
        });

    },

    remove_gaps: (input, cb) => {
        
        let seq = spawn('echo',['-e', `${input.sequence}`])
        let seqkit = spawn('seqkit', ['seq', '-g','-w', input.width, input.case])
        let result = ''

        seq.stdout.on('data', (data) => {
            seqkit.stdin.write(data)
        })
        seq.stderr.on('data', (data) => { console.error(`stderr seq: ${data}`);});
        seq.on('close', (code) => {
            console.log(`echo process exited with code ${code}`)
            seqkit.stdin.end();
        });

        seqkit.stdout.on('data', (data) => { result += data.toString();});    
        
        seqkit.on('close', (code) => {
            if(code == 0){
                console.log(`seqkit process exited with code ${code}`);
                return cb(null, result);
            }else{
                return cb('ERROR', null)
            }
            
        });

    },
    
    reverse: (input, cb) => {
        
        let seq = spawn('echo',['-e', `${input.sequence}`])
        let seqkit = spawn('seqkit', ['seq', '-r','-w', input.width, input.case])
        let result = ''

        seq.stdout.on('data', (data) => {
            seqkit.stdin.write(data)
        })
        seq.stderr.on('data', (data) => { console.error(`stderr seq: ${data}`);});
        seq.on('close', (code) => {
            console.log(`echo process exited with code ${code}`)
            seqkit.stdin.end();
        });

        seqkit.stdout.on('data', (data) => { result += data.toString();});    
        
        seqkit.on('close', (code) => {
            if(code == 0){
                console.log(`seqkit process exited with code ${code}`);
                return cb(null, result);
            }else{
                return cb('ERROR', null)
            }
            
        });

    },

    complement: (input, cb) => {

        let seq = spawn('echo',['-e', `${input.sequence}`])
        let seqkit = spawn('seqkit', ['seq', '-p','-w', input.width, input.case])
        let result = ''

        seq.stdout.on('data', (data) => {
            seqkit.stdin.write(data)
        })
        seq.stderr.on('data', (data) => { console.error(`stderr seq: ${data}`);});
        seq.on('close', (code) => {
            console.log(`echo process exited with code ${code}`)
            seqkit.stdin.end();
        });

        seqkit.stdout.on('data', (data) => { result += data.toString();});    
        
        seqkit.on('close', (code) => {
            if(code == 0){
                console.log(`seqkit process exited with code ${code}`);
                return cb(null, result);
            }else{
                return cb('ERROR', null)
            }
            
        });

    },

    reverse_complement: (input, cb) => {

        let seq = spawn('echo',['-e', `${input.sequence}`])
        let seqkit = spawn('seqkit', ['seq', '-r','-p','-w', input.width, input.case])
        let result = ''

        seq.stdout.on('data', (data) => {
            seqkit.stdin.write(data)
        })
        seq.stderr.on('data', (data) => { console.error(`stderr seq: ${data}`);});
        seq.on('close', (code) => {
            console.log(`echo process exited with code ${code}`)
            seqkit.stdin.end();
        });

        seqkit.stdout.on('data', (data) => { result += data.toString();});    
        
        seqkit.on('close', (code) => {
            if(code == 0){
                console.log(`seqkit process exited with code ${code}`);
                return cb(null, result);
            }else{
                return cb('ERROR', null)
            }
            
        });

    }
}