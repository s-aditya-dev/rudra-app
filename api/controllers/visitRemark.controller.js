import ClientVisit from "../models/clientVisit.model.js";
import VisitRemark from "../models/visitRemark.model.js";
import createError from "../utils/createError.js";

export const updateVisitRemark = async (req, res, next) => {
  try {
    const { visitId, remarkId } = req.params;
    const updateRemarkInfo = req.body;

    const visit = await ClientVisit.findById(visitId);
    if (!visit) return next(createError(404, "Client Visit not found"));

    const updatedRemark = await VisitRemark.findByIdAndUpdate(
      remarkId,
      updateRemarkInfo,
      { new: true }
    );
    if (!updatedRemark)
      return next(createError(404, "Client Visit Remark not found"));

    res.status(200).send(updatedRemark);
  } catch (error) {
    next(error);
  }
};

export const deleteVisitRemark = async (req, res, next) => {
  try {
    const { visitId, remarkId } = req.params;
    const visit = await ClientVisit.findById(visitId);
    if (!visit) return next(createError(404, "Client Visit not found"));
    const remarkIndex = visit.visitRemarkId.indexOf(remarkId);
    if (remarkIndex === -1)
      return next(createError(404, "RemarkId not found in Client Visit"));
    visit.visitRemarkId.splice(remarkIndex, 1);
    await visit.save();
    const remark = await VisitRemark.findByIdAndDelete(remarkId);
    if (!remark) return next(createError(404, "Client Visit Remark not found"));

    res.status(200).send("deleted from both schema deleted");
  } catch (error) {
    next(error);
  }
};

export const addRemark = async (req, res, next) => {
  try {
    const { visitId } = req.params;
    const newRemark = req.body;

    const visit = await ClientVisit.findById(visitId);
    if (!visit) return next(createError(404, "Client Visit not found"));

    const newVisitRemark = await VisitRemark.create(newRemark);

    visit.visitRemarkId.push(newVisitRemark._id);
    await visit.save();

    res.status(200).json({
      message: "New Remark Added successfully",
      remark: newVisitRemark,
    });
  } catch (error) {
    next(error);
  }
};
