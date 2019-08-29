import { startOfHour, parseISO, isBefore } from 'date-fns';

import Meetup from '../models/Meetup';
import MeetupValidator from '../validators/MeetupValidator';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async store(req, res) {
    const validator = new MeetupValidator();

    if (!(await validator.validate(req))) {
      return res.status(400).json({ error: validator.errors });
    }

    const { data_hora: date } = req.body;

    // Verify if date is past date
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const meetup = await Meetup.create({
      ...req.body,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const validator = new MeetupValidator();

    if (!(await validator.validate(req))) {
      return res.status(400).json({ error: validator.errors });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    /**
     * Verify is the user is the meetup owner
     */
    const { userId } = req;

    if (userId !== meetup.user_id) {
      return res
        .status(400)
        .json({ error: "You can't update meetups your're not the owner" });
    }

    /**
     * Verify if meetup date is past
     */
    if (isBefore(meetup.data_hora, new Date())) {
      return res.status(400).json({ error: "You can't update past meetups" });
    }

    /**
     * Verify if date is past date
     */
    const { data_hora: date } = req.body;

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    /**
     * Verify is the user is the meetup owner
     */
    const { userId } = req;

    if (userId !== meetup.user_id) {
      return res
        .status(400)
        .json({ error: "You can't delete meetups your're not the owner" });
    }

    /**
     * Verify if meetup date is past
     */
    if (isBefore(meetup.data_hora, new Date())) {
      return res.status(400).json({ error: "You can't delete past meetups" });
    }

    await meetup.destroy();

    return res.send();
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      order: ['data_hora'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'titulo', 'descricao', 'localizacao', 'data_hora'],
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(meetups);
  }
}

export default new MeetupController();
