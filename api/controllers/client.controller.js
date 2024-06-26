import Client from "../models/client.model.js";
import ClientVisit from "../models/clientVisit.model.js";
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

export const getClients = async (req, res, next) => {
  try {
    const clients = await Client.find({}).populate("clientVisits");
    if (!clients) return next(createError(403, "there is not client"));

    res.status(200).send(clients);
  } catch (err) {
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
