import isUndefined from 'lodash/isUndefined';
import { ObjectId } from 'mongodb';
import {
  UsersModel,
  FAQsModel,
  BuildingsModel,
} from '../models';
import Service from '../mongo/service';

export async function create({ name, message, author, building }) {
  try {
    if (isUndefined(author)) {
      throw new Error('document author is undefined');
    }
    if (isUndefined(name)) {
      throw new Error('document name is undefined');
    }
    if (isUndefined(message)) {
      throw new Error('document attachment does not exist');
    }
    if (!await BuildingsModel.findOne({ _id: new ObjectId(building) })) {
      throw new Error('author does not exist');
    }
    if (!await UsersModel.findOne({ _id: new ObjectId(author) })) {
      throw new Error('author does not exist');
    }
    const r = await FAQsModel.create({ name, message, author, building });
    return r;
  } catch (e) {
    throw e;
  }
}

export async function update({ _id, name, message, author, building }) {
  try {
    const r = await FAQsModel.findOne({
      _id,
      building,
    });
    if (!r) {
      throw new Error('document does not exists');
    }
    if (isUndefined(author)) {
      throw new Error('document author is undefined');
    }
    if (isUndefined(name)) {
      throw new Error('document name is undefined');
    }
    if (isUndefined(message)) {
      throw new Error('document attachment does not exist');
    }
    if (!await BuildingsModel.findOne({ _id: new ObjectId(building) })) {
      throw new Error('building does not exist');
    }
    if (!await UsersModel.findOne({ _id: new ObjectId(author) })) {
      throw new Error('author does not exist');
    }
    return await FAQsModel.findOneAndUpdate({ _id }, { $set: { name, message, author, building } }, { new: true });
  } catch (e) {
    throw e;
  }
}

export async function softDelete({ _id, building }) {
  try {
    const r = await FAQsModel.findOne({
      _id,
      building,
    });
    if (!r) {
      throw new Error('document does not exists');
    }
    if (!await BuildingsModel.findOne({ _id: new ObjectId(building) })) {
      throw new Error('building does not exist');
    }
    await FAQsModel.update({
      _id,
    }, {
      $set: {
        isDeleted: true,
      },
    });
    return r;
  } catch (e) {
    throw e;
  }
}

export function service(paginate) {
  return Service({
    Model: FAQsModel,
    paginate: {
      default: 10,
      max: 20,
      ...paginate,
    },
    cursor: true,
  });
}
