import { Request, Response } from "express";
import knex from "../database/connections";
import { parseISO, startOfHour, format, isPast } from "date-fns";

class EventsController {
  async index(request: Request, response: Response) {
    try {
      const events = await knex('rooms_events')
      .join('events', 'events.id_event', '=', 'rooms_events.id_event')
      .join('rooms', 'rooms.id_room', '=', 'rooms_events.id_room')
      .select('rooms.name AS room_name',
       'rooms.building',
       'events.*');

      const serializedItems = events.map(event => {
        return {
          id_event: event.id_event,
          building: event.building,
          name_room: event.room_name,
          name_event: event.name,
          description: event.description,
          date_time: format(event.date_time, "dd'/'MM'/'yyyy HH':'mn"),
          responsible: event.responsible
        }
      })    
      response.json(serializedItems)   

    } catch (error) {
      return response.json({ error: 'Something went wrong'});
    }
  }

  async create(request: Request, response: Response) {
    try {
        const { name, description, date_time, responsible, rooms } = request.body;

        const trx = await knex.transaction();

        const parseDateTime = parseISO(date_time);
        const eventDateTime = startOfHour(parseDateTime);

        if(isPast(parseDateTime)) {
          await trx.rollback();
          return response.json('This date is before the actual date and hour');
        }

        for(var i = 0; i < rooms.length; i++) {
          const findEventsInSameDate = await trx('rooms_events')
          .join('events', 'events.id_event', '=', 'rooms_events.id_event')
          .join('rooms', 'rooms.id_room', '=', 'rooms_events.id_room')
          .where('date_time', eventDateTime)
          .where('rooms_events.id_room', rooms[i])
          .select('*')
          .first();

          if(findEventsInSameDate) {
            await trx.rollback();
            return response.json('There is an events already booked in the same same local and date')
          }
        }

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
