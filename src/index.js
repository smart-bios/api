import express from 'express'
import mongoose from 'mongoose';
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import history from 'connect-history-api-fallback'
import path from 'path'
import rutas from './routes'
import fileUpload  from 'express-fileupload'


const app = express()

//middllewares
app.use(morgan('tiny'));
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({extended:false}));
app.use(fileUpload());

//Rutas
app.use('/api',rutas);

//Archivos estaticos
app.use(history());
app.use(express.static(path.join(__dirname ,'/public')));

//Database
const database = 'red_genomica'
const url = 'mongodb://localhost:27017/'+database
const option = {
    useCreateIndex: true,
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false
};

mongoose.connect(url, option)
.then(() => console.log(`conenctado a base de datos ${database}`))
.catch(e => console.log(e));


process.env.PORT = process.env.PORT || 3000

app.listen(process.env.PORT, () => {
    console.log('Sirviendo en puerto ', process.env.PORT);
});
