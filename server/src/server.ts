import express from 'express';
import routes from './routes';
import cors from 'cors';
import { errors } from 'celebrate';

const app = express();

app.use(cors());

app.use(express.json());
app.use(errors());

app.use(routes);
app.listen(3333);