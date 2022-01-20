import { Request, Response } from 'express';
import knex from '../database/connections';

class RoomsController {
    async index(request: Request, response: Response) {
        const rooms = await knex('rooms').select('rooms.*');
        return response.json(rooms);
    }
}

export default RoomsController;