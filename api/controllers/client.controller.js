import Client from "../models/client.model.js";
import ClientVisit from "../models/clientVisit.model.js";
import VisitRemark from "../models/visitRemark.model.js";
import createError from "../utils/createError.js";
import ClientCounter from "../models/clientCounter.model.js";

export const createClient = async (req, res, next) => {
  try {
    const cd = await ClientCounter.findOneAndUpdate(
      { id: "autoval" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (cd === null) {
      const newval = new ClientCounter({ id: "autoval", seq: 1 });
      await newval.save();
    }

    const newClient = new Client({ ...req.body, clientId: cd ? cd.seq : 1 });

    await newClient.save();

    res.status(200).send(newClient);
  } catch (err) {
    next(err);
  }
};


export const createClientWithVisit = async (req, res, next) => {
  try {
    const cd = await ClientCounter.findOneAndUpdate(
      { id: "autoval" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (cd === null) {
      const newval = new ClientCounter({ id: "autoval", seq: 1 });
      await newval.save();
    }

    const newClient = await Client.create({
      clientId: cd ? cd.seq : 1,
      ...req.body,
    });

    const newClientVisit = await ClientVisit.create({
      ...req.body,
      client: newClient._id,
    });

    const { visitRemark, date, time } = req.body;

    if (visitRemark) {
      const newVisitRemark = await VisitRemark.create({
        visitRemark,
        date,
        time,
      });

      newClientVisit.visitRemarkId.push(newVisitRemark._id);

      await newVisitRemark.save();
    }
    newClient.clientVisits.push(newClientVisit._id);

    await newClientVisit.save();
    await newClient.save();

    res.status(200).send("New client visit saved");
  } catch (error) {
    next(error);
  }
};


export const getClients = async (req, res, next) => {
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
      return !!latestVisit; // Keep clients that have at least one visit
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

export const getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).populate(
      "clientVisits"
    );
    if (!client) return next(createError(404, "no client found"));

    res.status(200).send(client);
  } catch (err) {
    next(err);
  }
};

export const getUserClients = async (req, res, next) => {
  const { managerType, firstName } = req.query;

  const validManagerTypes = ['source', 'relation', 'closing'];

  if (!validManagerTypes.includes(managerType)) {
    return next(createError(400, 'Invalid manager type'));
  }

  try {
    const clients = await Client.find({})
      .populate({
        path: 'clientVisits',
        model: 'ClientVisit',
        options: { sort: { date: -1 }, limit: 1 },
      })
      .exec();

    const filteredClients = clients.filter(client => {
      const latestVisit = client.clientVisits[0];
      if (!latestVisit) return false;

      const isManagerMatch = (
        latestVisit.sourcingManager === firstName ||
        latestVisit.relationshipManager === firstName ||
        latestVisit.closingManager === firstName
      );

      return isManagerMatch;
    });

    if (!filteredClients.length) {
      console.log('No clients found after filtering');
      return next(createError(403, 'No clients found for the given criteria'));
    }

    res.status(200).json(filteredClients);
  } catch (err) {
    console.error('Error:', err);
    next(err);
  }
};



export const getAllVisits = async (req, res, next) => {
  try {
    const visits = await ClientVisit.find({});

    if (!visits) return next(createError(404, "no client visits found"));

    res.status(200).send(visits);
  } catch (err) {
    next(err);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedClient = req.body;

    const client = await Client.findByIdAndUpdate(id, updatedClient, {
      new: true,
    });
    if (!client) return next(createError(404, "Client Not Found"));

    res.status(200).send(client);
  } catch (err) {
    next(err);
  }
};

export const deleteClientAndVisits = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return next(createError(404, "client not found"));

    for (const clientVisit of client.clientVisits) {
      await ClientVisit.findByIdAndDelete(clientVisit._id);
    }

    res.status(200).send("client deleted");
  } catch (err) {
    next(err);
  }
};
