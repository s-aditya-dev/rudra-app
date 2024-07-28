import NewClient from "../models/newClient.model.js";
import NewClientCounter from "../models/newClientCounter.model.js";
import createError from "../utils/createError.js";
import ClientCounter from "../models/clientCounter.model.js";
import ClientVisit from "../models/clientVisit.model.js";
import Client from "../models/client.model.js";
import VisitRemark from "../models/visitRemark.model.js";

export const createNewClient = async (req, res, next) => {
  try {
    const cd = await NewClientCounter.findOneAndUpdate(
      { id: "autoval" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (cd === null) {
      const newval = new NewClientCounter({ id: "autoval", seq: 1 });
      await newval.save();
    }

    const newClient = new NewClient({ ...req.body, clientId: cd ? cd.seq : 1 });

    await newClient.save();

    res.status(200).send(newClient);
  } catch (err) {
    next(err);
  }
};

export const getNewClient = async (req, res, next) => {
  try {
    const client = await NewClient.findById(req.params.id);

    if (!client) return next(createError(404, "no client found"));

    res.status(200).send(client);
  } catch (err) {
    next(err);
  }
};

export const getNewClients = async (req, res, next) => {
  try {
    const newClients = await NewClient.find({});
    if (newClients.length < 1)
      return next(createError(404, "No New Clients found"));

    res.status(200).send(newClients);
  } catch (error) {
    next(error);
  }
};

export const newClientAddVisit = async (req, res, next) => {
  try {
    const client = await NewClient.findById(req.params.id);
    if (!client) return next(createError(404, "Client Not Found"));

    const clientObj = client;

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
      firstName: clientObj.firstName,
      lastName: clientObj.lastName,
      contact: clientObj.contact,
      altContact: clientObj.altContact,
      address: clientObj.address,
      occupation: clientObj.occupation,
      email: clientObj.email,
      requirement: clientObj.requirement,
      budget: clientObj.budget,
      note: clientObj.note,
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

    await NewClient.findByIdAndDelete(req.params.id);

    res.status(200).send("NewClient Moved to Client List");
  } catch (error) {
    next(error);
  }
};

export const updateNewClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedClient = req.body;

    const client = await NewClient.findByIdAndUpdate(id, updatedClient, {
      new: true,
    });
    if (!client) return next(createError(404, "New Client not Found"));

    res.status(200).send(client);
  } catch (error) {
    next(error);
  }
};

export const deleteNewClient = async (req, res, next) => {
  try {
    const client = await NewClient.findById(req.params.id);
    if (!client) return next(createError(404, "Client not Found"));

    await NewClient.findByIdAndDelete(req.params.id);

    res.status(200).send("Client Deleted");
  } catch (error) {
    next(error);
  }
};
