import isString from 'lodash/isString';
import ApartmentsModel from '../models/ApartmentsModel';
import { FeeModel } from '../models/FeeModel';
import toObjectId, { ObjectIdValid } from '../../utils/toObjectId';

async function getFeeOfApartment(filter) {
  const fees = await FeeModel.find(filter);
  return fees;
}

async function residentsInBuildingGroupByApartmentQuery({ building, apartment, resident }) {
  if (!ObjectIdValid(building)) {
    throw new Error('The building id is invalid.');
  }

  const aggregate = [];

  // Query by building
  aggregate.push({
    $match: {
      building: toObjectId(building),
    },
  });

  // Defined all fields that you need
  aggregate.push({
    $project: {
      _id: 1,
      name: 1,
      number: 1,
      building: 1,
      createdAt: 1,
      owner: 1,
      owners: {
        $cond: [
          { $not: ['$owner'] }, [], ['$owner'],
        ],
      },
      users: {
        $cond: [
          { $isArray: '$users' }, '$users', [],
        ],
      },
    },
  });

  // Create new field with merge two array-field
  aggregate.push({
    $project: {
      _id: 1,
      name: 1,
      number: 1,
      building: 1,
      createdAt: 1,
      owner: 1,
      residents: {
        $concatArrays: [
          '$owners',
          '$users',
        ],
      },
    },
  });

  // Deconstructs $residents field to create new data and always keep the document including $residents is empty
  aggregate.push({
    $unwind: {
      path: '$residents',
      preserveNullAndEmptyArrays: true,
    },
  });

  // Join with collection named users for check existing user
  aggregate.push({
    $lookup: {
      from: 'users',
      localField: 'residents',
      foreignField: '_id',
      as: 'residents',
    },
  });

  // Deconstructs $residents field to create new data and always keep the document including $residents is empty
  aggregate.push({
    $unwind: {
      path: '$residents',
      preserveNullAndEmptyArrays: true,
    },
  });

  // Determine whether apartment filtering already exists.
  const apartmentMatchesOr = [];
  apartment = isString(apartment) ? String(apartment).trim() : '';
  if (apartment.length > 0) {
    // With apartment name
    apartmentMatchesOr.push({
      name: {
        $regex: apartment,
        $options: 'si',
      },
    });
    // With apartment number
    apartmentMatchesOr.push({
      number: {
        $regex: apartment,
        $options: 'si',
      },
    });
  }

  // Determine whether resident filtering already exists.
  const residentMatchesOr = [];
  resident = isString(resident) ? String(resident).trim() : '';
  if (resident.length > 0) {
    // With username
    residentMatchesOr.push({
      'residents.username': {
        $regex: resident,
        $options: 'si',
      },
    });
    // With first name
    residentMatchesOr.push({
      'residents.profile.firstName': {
        $regex: resident,
        $options: 'si',
      },
    });
    // With last name
    residentMatchesOr.push({
      'residents.profile.lastName': {
        $regex: resident,
        $options: 'si',
      },
    });
    // With searching data
    residentMatchesOr.push({
      'residents.search': {
        $regex: resident,
        $options: 'si',
      },
    });
  }

  // Create filter
  const $match = [];
  if (apartmentMatchesOr.length > 0) {
    $match.push({
      $or: apartmentMatchesOr,
    });
  }

  if (residentMatchesOr.length > 0) {
    $match.push({
      $or: residentMatchesOr,
    });
  }

  if ($match.length > 0) {
    aggregate.push({
      $match: {
        $and: $match,
      },
    });
  }

  // Group all residents by apartment
  aggregate.push(
    {
      $group: {
        _id: '$_id',
        name: {
          $first: '$name',
        },
        number: {
          $first: '$number',
        },
        building: {
          $first: '$building',
        },
        owner: {
          $first: '$owner',
        },
        createdAt: {
          $first: '$createdAt',
        },
        residents: {
          $addToSet: '$residents',
        },
      },
    },
  );

  // Sorting
  aggregate.push({
    $sort: {
      createdAt: 1,
    },
  });

  // Get number of apartments and number of residents
  let queryStats = await ApartmentsModel.aggregate([
    ...aggregate,
    {
      $group: {
        _id: null,
        residents: {
          $addToSet: '$residents',
        },
        numberOfApartments: {
          $sum: 1,
        },
      },
    },
    {
      $unwind: '$residents',
    },
    {
      $unwind: '$residents',
    },
    {
      $group: {
        _id: null,
        residents: {
          $addToSet: '$residents',
        },
        numberOfApartments: {
          $first: '$numberOfApartments',
        },
      },
    },
    {
      $group: {
        _id: null,
        numberOfResidents: {
          $sum: {
            $size: '$residents',
          },
        },
        numberOfApartments: {
          $first: '$numberOfApartments',
        },
      },
    },
  ]).cursor({ async: true }).exec();

  if (queryStats.length > 0) {
    queryStats = queryStats.shift();
  } else {
    queryStats = {
      numberOfApartments: 0,
      numberOfResidents: 0,
    };
  }

  return {
    aggregate,
    queryStats,
    hasData: queryStats.numberOfApartments > 0,
  };
}

export default {
  getFeeOfApartment,
  residentsInBuildingGroupByApartmentQuery,
};
