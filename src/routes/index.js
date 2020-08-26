import express from 'express';
import userRuta from './user';
import storageRuta from './file';
import toolsRuta from './tools';
import seqRuta from './sequence';
import genomeRuta from './genomes'


const ruta = express.Router();

ruta.use('/user',userRuta);
ruta.use('/storage',storageRuta);
ruta.use('/tools', toolsRuta);
ruta.use('/seq',seqRuta);
ruta.use('/genome', genomeRuta);

export default ruta