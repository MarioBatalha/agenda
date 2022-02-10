import { Request, Response } from "express";
import knex from "../database/connections";
import {
  parseISO,
  startOfHour,
  format,
  isPast,
  startOfDay,
  endOfDay,
} from "date-fns";

class EventsController {
  async index(request: Request, response: Response) {
    try {
      const events = await knex("rooms_events")
        .join("events", "events.id_event", "=", "rooms_events.id_event")
        .join("rooms", "rooms.id_room", "=", "rooms_events.id_room")
        .select([
          knex.raw("group_concat(rooms.name AS room_name"),
          knex.raw("group_concat(rooms.building) AS building"), 
          'events.*'
        ])
        .groupBy('rooms_events.id_event')
        .orderBy('date_time')

      const serializedItems = events.map((event) => {

        const buildingArray =  event.building.split(',');
        const roomNameArray =  event.rooms_name.split(',');

        const buildingsRooms = [];

        for(var i = 0; i < buildingArray.length; i++) {
          buildingsRooms.push({ building: buildingArray[i], room: roomNameArray});
        }

        return {
          id_event: event.id_event,
          location: buildingsRooms,
          name_room: event.room_name,
          name_event: event.name,
          description: event.description,
          date_time: format(event.date_time, "'Data: dd'/'MM'/'yyyy  'Horário:' HH':'mn"),
          responsible: event.responsible,
        };
      });
      response.json(serializedItems);
    } catch (error) {
      return response.json({ error: "Something went wrong list event" });
    }
  }

  async eventOfDay(request: Request, response: Response) {
    try {
      const { day = Date.now() } = request.query;

      const searchDate = parseISO(day.toLocaleString());

      const events = await knex("rooms_events")
        .join("events", "events.id_event", "=", "rooms_events.id_event")
        .join("rooms", "rooms.id_room", "=", "rooms_events.id_room")
        .select("rooms.name AS room_name", "rooms.building", "events.*")
        .whereBetween("date_time", [
          startOfDay(searchDate),
          endOfDay(searchDate),
        ]);

      const serializedItems = events.map((event) => {
        return {
          id_event: event.id_event,
          building: event.building,
          name_room: event.room_name,
          name_event: event.name,
          description: event.description,
          date_time: format(event.date_time, "dd'/'MM'/'yyyy HH':'mn"),
          responsible: event.responsible,
        };
      });
      response.json(serializedItems);
    } catch (error) {
      return response.json({ error: "Something went wrong list event" });
    }
  }

  async create(request: Request, response: Response) {
    try {
      const { name, description, date_time, responsible, rooms } = request.body;

      const trx = await knex.transaction();

      const parseDateTime = parseISO(date_time);
      const eventDateTime = startOfHour(parseDateTime);

      if (isPast(parseDateTime)) {
        await trx.rollback();
        return response.json("This date is before the actual date and hour");
      }

      for (var i = 0; i < rooms.length; i++) {
        const findEventsInSameDate = await trx("rooms_events")
          .join("events", "events.id_event", "=", "rooms_events.id_event")
          .join("rooms", "rooms.id_room", "=", "rooms_events.id_room")
          .where("date_time", eventDateTime)
          .where("rooms_events.id_room", rooms[i])
          .select("*")
          .first();

        if (findEventsInSameDate) {
          await trx.rollback();
          return response.json(
            "There is an events already booked in the same same local and date"
          );
        }
      }

      const event = {
        name,
        description,
        date_time: eventDateTime,
        responsible,
      };

      const eventCreated = await trx("event").insert(event);
      const id_event = eventCreated[0];

      const rooms_events = rooms.maps((id_room: Number) => {
        return {
          id_room,
          id_event,
        };
      });

      await trx("rooms_events").insert(rooms_events);
      await trx.commit();

      return response.json({ message: "Event inserted" });
    } catch (error) {
      return response.json({ error: "Something went wrong creating event" });
    }
  }

  async remove(request: Request, response: Response) {
    try {
      const { id_event } = request.params;

      const trx = await knex.transaction();
      const verify = await trx("events").where("id_event", id_event).del();

      if (verify === 0) {
        await trx.rollback();
        return response.json({ message: "event not exists" });
      }

      await trx("rooms_events").where("id_event", id_event).del();

      await trx.commit();
      return response.json({ message: "event deleted with success!" });
    } catch (error) {
      return response.json({ error: "Something went wrong to remove event" });
    }
  }
}

export default EventsController;
