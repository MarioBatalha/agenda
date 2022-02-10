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

  async dataUpdate(request: Request, response: Response) {
    try {
      const { id_room } = request.params;
      const rooms = await knex('rooms').select('rooms.*')
      .where('id_room', id_room)
      .first();

      if(!rooms) return response.send('Room not exists');
      
      return response.json(rooms);
    } catch (error) {
      response.json({ error: "Error to update rooms" });
    }
  }

  async create(request: Request, response: Response) {
    try {
      const { name } = request.body;

      const trx = await knex.transaction();

      const roomsExists = await trx("rooms").where("name", name).first();
      if (roomsExists) {
        await trx.rollback();
        return response.status(400).json({ errors: "Room is already created" });
      }

      const room = await trx("rooms").insert(request.body);

      await trx.commit();
      return response.json(`Room with id ${room} created with success!`);
    } catch (error) {
      response.json({ error: "Error creating a new rooms" });
    }
  }

  async remove(request: Request, response: Response) {
    try {
      const { id_room } = request.body;

      const room = await knex("rooms").where("id_room", id_room).del();
      if (room === 0) {
        return response.json("Room already deleted");
      }
      return response.json("Room deleted with success");
    } catch (error) {
      response.json({ error: "You can't delete this room" });
    }
  }

  async update(request: Request, response: Response) {
    try {
      const { id_room } = request.params;

      const { name, building } = request.body;

      const trx = await knex.transaction();
      const idExists = await trx('rooms').where('id_room', id_room).first();

      if(!idExists) {
        await trx.rollback();
        return response.status(400).json({ error: "Room not exists"})
      }

      const roomExists = await trx("rooms")
      .where("name", name)
      .whereNot("id_room", id_room)
      .first()
      .select("*")

      if(roomExists) {
        await trx.rollback();
        return response.status(400).json({ error: "Rooms already exists"});
      }

      const room = await trx("rooms").where("id_room", id_room).update({
        name, 
        building
      });

      await trx.commit();
      response.json(`Room with id ${room} was updated with success`)
       
    } catch (error) {
      response.json({ error: "You cannot update this rooms" });
    }
  }
}

export default RoomsController;
