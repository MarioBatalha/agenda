import express from 'express';

import RoomsController from './controllers/RoomsController';
import EventsController from './controllers/EventsControllers';

const routes = express.Router();

const roomsController = new RoomsController();
const eventsController =  new EventsController();

routes.get('/rooms', roomsController.index);
routes.post('/rooms', roomsController.create);
routes.put('/rooms/:id_room', roomsController.update);
routes.delete('/rooms', roomsController.remove);

routes.post('/events', eventsController.create);

export default routes;  