import express from 'express';

import RoomsController from './controllers/RoomsController';

const routes = express.Router();

const roomsController = new RoomsController();

routes.get('/rooms', roomsController.index);
routes.post('/rooms', roomsController.create);
routes.put('/rooms/:id_room', roomsController.update);
routes.delete('/rooms', roomsController.remove);

export default routes;  