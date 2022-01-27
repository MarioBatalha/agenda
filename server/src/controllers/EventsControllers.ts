import { Request, Response } from "express";
import knex from "../database/connections";
import { parseISO, startOfHour, format, isPast } from "date-fns";

class EventsController {
  async create(request: Request, response: Response) {
    try {
        const { name, description, date_time, responsible, rooms } = request.body;

        const trx = await knex.transaction();

        const parseDateTime = parseISO(date_time);
        const eventDateTime = startOfHour(parseDateTime);

        const event = {
        name,
        description,
        date_time: eventDateTime,
        responsible,
        };

        const eventCreated = await trx('event').insert(event); 
        const id_event = eventCreated[0];

        const rooms_events = rooms
        .maps((id_room: Number) => {
            return {
                id_room,
                id_event,
            }
        });

        await trx('rooms_events').insert(rooms_events);
        await trx.commit();

        return response.json({message: "Event inserted"})
    } catch (error) {
        return response.json({error: "Something went wrong creating event"})
    }
  }
}

export default EventsController;
