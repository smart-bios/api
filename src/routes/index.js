import express from 'express';
import userRuta from './user';
import storageRuta from './file';
import toolsRuta from './tools'

const ruta = express.Router();

ruta.use('/user',userRuta);
ruta.use('/storage',storageRuta);
ruta.use('/tools', toolsRuta);

export default ruta