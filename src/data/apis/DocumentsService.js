import fs from 'fs';
import { URL } from 'url';
import isUndefined from 'lodash/isUndefined';
import { ObjectId } from 'mongodb';
import {
  UsersModel,
  DocumentsModel,
  BuildingsModel,
} from '../models';
import Service from '../mongo/service';

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

function getFilePathFromUrl(url) {
  const { pathname } = new URL(url);
  const staticPath = `${__dirname}${pathname}`;
  return fileExists(staticPath) ? staticPath : undefined;
}

export async function findOne(_id) {
  return DocumentsModel.findOne({
    _id,
    isDeleted: {
      $exists: false,
    },
  });
}

export async function create({ name, file, author, building }) {
  try {
    if (isUndefined(author)) {
      throw new Error('document author is undefined');
    }
    if (isUndefined(name)) {
      throw new Error('document name is undefined');
    }
    if (isUndefined(file)) {
      throw new Error('document attachment does not exist');
    }
    if (!await BuildingsModel.findOne({ _id: new ObjectId(building) })) {
      throw new Error('author does not exist');
    }
    if (!await UsersModel.findOne({ _id: new ObjectId(author) })) {
      throw new Error('author does not exist');
    }
    const r = await DocumentsModel.create({ name, file, author, building });
    return r;
  } catch (e) {
    throw e;
  }
}

export async function update({ _id, name, file, author, building }) {
  try {
    const r = await DocumentsModel.findOne({
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
    if (isUndefined(file)) {
      throw new Error('document attachment does not exist');
    }
    if (!await BuildingsModel.findOne({ _id: new ObjectId(building) })) {
      throw new Error('building does not exist');
    }
    if (!await UsersModel.findOne({ _id: new ObjectId(author) })) {
      throw new Error('author does not exist');
    }
    return await DocumentsModel.findOneAndUpdate({ _id }, { $set: { name, file, author, building } }, { new: true });
  } catch (e) {
    throw e;
  }
}

export async function softDelete({ _id, building }) {
  try {
    const r = await DocumentsModel.findOne({
      _id,
      building,
    });
    if (!r) {
      throw new Error('document does not exists');
    }
    if (!await BuildingsModel.findOne({ _id: new ObjectId(building) })) {
      throw new Error('building does not exist');
    }
    await DocumentsModel.update({
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
    Model: DocumentsModel,
    paginate: {
      default: 10,
      max: 20,
      ...paginate,
    },
    cursor: true,
  });
}
