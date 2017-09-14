import mongoose from 'mongoose';

const { Types: { ObjectId } } = mongoose;

const toObjectId = (idStr) => {
  let id = null;
  try {
    id = ObjectId(idStr);
  } catch (err) {
    throw err;
  }
  return id;
};

export default toObjectId;

const ObjectIdValid = (_id) => {
  try {
    return ObjectId(_id);
  } catch (e) {
    return false;
  }
};

export {
  ObjectIdValid,
};
