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
routes.get('/events', eventsController.index);
routes.get('/events_of_day', eventsController.eventOfDay);
routes.delete('/events/:id_room', eventsController.remove);

export default routes;  