import fs from 'fs';
import path from 'path';


export default {

    tsv2JsonNoHead: (tsv, headers) => {
        let lines = tsv.split('\n');
        return lines.map(line => {
            let data = line.split('\t');
            return headers.reduce((obj, nextKey, index) => {
                obj[nextKey] = data[index];
                return obj;
            }, {});
        })
    },
    
    tsv2Json: (tsv) => {
        let lines = tsv.split('\n');
        let headers = lines.shift().split('\t');
        return lines.map(line => {
            let data = line.split('\t');
            return headers.reduce((obj, nextKey, index) => {
                obj[nextKey] = data[index];
                return obj;
            }, {});
        })
    },

    parseSummary: (summary) => {
        let data = fs.readFileSync(summary,'utf8')
        let headers = ['status','module','library']
        let lines = data.split('\n');
        return lines.map(line => {
            let data = line.split('\t');
            return headers.reduce((obj, nextKey, index) => {
                obj[nextKey] = data[index];
                return obj;
            }, {});
        })
    },

    parseFastqData: (fastqc_data) => {
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
    },

    parseTrimGalore: (report) => {
        let data = fs.readFileSync(report,'utf8')
        let lines = data.split('\n')
        let summary = lines.slice(27,34)
        return summary
    },

    
    



}