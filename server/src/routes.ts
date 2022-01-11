import express from 'express';

const routes = express.Router();

routes.get('/', (request, response) => {
    return response.json('it is  works');
})

export default routes;