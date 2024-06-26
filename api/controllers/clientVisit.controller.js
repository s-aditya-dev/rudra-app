import ClientVisit from "../models/clientVisit.model.js";
import Client from "../models/client.model.js";
import createError from "../utils/createError.js";
import User from "../models/user.model.js";

export const createClientVisit = async (req, res, next) => {
  try {
    const client = await Client.findById(req.clientID);

    if (!client) {
      return res.status(404).send("Client not found");
    }
    const newClientVisit = await ClientVisit({
      ...req.body,
      client: req.clientID,
    });

    client.clientVisits.push(newClientVisit);

    await newClientVisit.save();
    await client.save();

    res.status(200).send("new visit client saved");
  } catch (err) {
    next(err);
  }
};

export const getClientVisits = async (req, res, next) => {
  try {
    const clientVisits = await ClientVisit.find({});

    if (clientVisits.length === 0) {
      return next(createError(404, "No client visits found for this client"));
    }

    res.status(200).send(clientVisits);
  } catch (err) {
    next(err);
  }
};

export const getClientVisitDetails = async (req, res, next) => {
  try {
    const managersData = await User.aggregate([
      {
        $project: {
          firstName: 1,
          lastName: 1,
          manager: 1,
        },
      },
    ]);

    if (!managersData || managersData.length === 0) {
      return next(createError(404, "No managers found"));
    }

    res.status(200).send(managersData);
  } catch (err) {
    next(err);
  }
};

export const getClientVisit = async (req, res, next) => {
  try {
    const clientVisit = await ClientVisit.findById(req.params.id);
    if (!clientVisit) return next(createError(404, "no client visit found"));

    res.status(200).send(clientVisit);
  } catch (err) {
    next(err);
  }
};

export const updateClientVisit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedClientVisit = req.body;

    const clientVisit = await ClientVisit.findByIdAndUpdate(
      id,
      updatedClientVisit,
      { new: true }
    );

    if (!clientVisit) return next(createError(404, "Client Visit Not Found"));

    res.status(200).send(clientVisit);
  } catch (err) {
    next(err);
  }
};

export const deleteClientVisit = async (req, res, next) => {
  try {
    const clientVisit = await ClientVisit.findByIdAndDelete(req.params.id);
    if (!clientVisit) return next(createError(404, "Client visit not found"));

    res.status(200).send("client visit deleted");
  } catch (err) {
    next(err);
  }
};
