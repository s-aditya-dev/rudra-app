import Client from "../models/client.model.js";
import ClientVisit from "../models/clientVisit.model.js";
import createError from "../utils/createError.js";

export const getDumpedClients = async (req, res, next) => {
  const { days = 30 } = req.query;

  try {
    const clients = await Client.find({}).populate({
      path: 'clientVisits',
      model: 'ClientVisit',
      options: { sort: { date: -1 }, limit: 1 }
    });

    if (!clients.length) {
      console.log('No clients found');
      return next(createError(403, 'There is no client'));
    }

    const currentDate = new Date();
    const daysAgo = new Date(currentDate.setDate(currentDate.getDate() - days));

    const filteredClients = clients.filter(client => {
      const latestVisit = client.clientVisits[0];
      if (!latestVisit) return false;

      const visitDate = new Date(latestVisit.date);
      const isWithinDays = visitDate >= daysAgo;

      return (
        !isWithinDays && latestVisit.status !== 'booked' && latestVisit.status !== 'lost'
      );
    });

    if (!filteredClients.length) {
      console.log('No clients found after filtering');
      return next(createError(403, 'No clients found for the given criteria'));
    }

    res.status(200).send(filteredClients);
  } catch (err) {
    console.error('Error:', err);
    next(err);
  }
};


export const getLostClients = async (req, res, next) => {
  try {
    const clients = await Client.find({}).populate({
      path: 'clientVisits',
      model: 'ClientVisit',
      options: { sort: { date: -1 }, limit: 1 }
    });

    if (!clients.length) {
      console.log('No clients found');
      return next(createError(403, 'There is no client'));
    }

    const filteredClients = clients.filter(client => {
      const latestVisit = client.clientVisits[0];
      if (!latestVisit) return false;

      return latestVisit.status === 'lost';
    });

    if (!filteredClients.length) {
      console.log('No clients found after filtering');
      return next(createError(403, 'No clients found for the given criteria'));
    }

    res.status(200).send(filteredClients);
  } catch (err) {
    console.error('Error:', err);
    next(err);
  }
};
