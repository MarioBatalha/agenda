import express from 'express';
import { celebrate, Joi} from 'celebrate';

import RoomsController from './controllers/RoomsController';
import EventsController from './controllers/EventsControllers';

const routes = express.Router();

const roomsController = new RoomsController();
const eventsController =  new EventsController();

routes.get('/rooms', roomsController.index);
routes.post('/rooms', celebrate({
    body: Joi.object().keys({
        name: Joi.string().required().max(50),
        building: Joi.string().required().max(50)
    })
}, { abortEarly: false}), roomsController.create);
routes.put('/rooms/:id_room', roomsController.update);
routes.put('/rooms/:id_room', roomsController.dataUpdate);
routes.delete('/rooms', roomsController.remove);

routes.post('/events', celebrate({
    body: Joi.object().keys({
        name: Joi.string().required().max(50),
        description: Joi.string().required().max(2000),
        responsible: Joi.string().required().max(50)
    })
}), eventsController.create);
routes.get('/events', eventsController.index);
routes.get('/events_of_day', eventsController.eventOfDay);
routes.delete('/events/:id_room', eventsController.remove);

export default routes;  