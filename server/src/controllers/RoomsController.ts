import { errors } from "celebrate";
import { Request, Response } from "express";
import knex from "../database/connections";

class RoomsController {
  async index(request: Request, response: Response) {
    try {
      const rooms = await knex("rooms").select("rooms.*");
      return response.json(rooms);
    } catch (error) {
      response.json({ error: "Error trying to listing rooms" });
    }
  }

  async create(request: Request, response: Response) {
    try {
      const { name } = request.body;

      const trx = await knex.transaction();

      const roomsExists = await trx("rooms").where("name", name).first();
      if(roomsExists) {
          await trx.rollback();
          return response.status(400).json({ errors: 'Room is already created'})
      };

      const room = await trx('rooms').insert(request.body);

      await trx.commit();
      return response.json(`Room with id ${room} created with success!`);
      
    } catch (error) {
        response.json({ error: "Error creating a new rooms"})
    }
  }
}

export default RoomsController;
