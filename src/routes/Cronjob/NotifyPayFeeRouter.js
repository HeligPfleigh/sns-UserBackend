import moment from 'moment';
import logger from '../../data/logger';
import BuildingServices from '../../data/apis/BuildingServices';
import BuildingSettingsService from '../../data/apis/BuildingSettingsService';
import { FeeModel } from '../../data/models/FeeModel';
import { UNPAID } from '../../constants';
import { sendRemindFeeNotification } from '../../utils/notifications';

const getBuildingFeeSettings = async (building) => {
  const settings = BuildingSettingsService.Model.aggregate([
    {
      $match: {
        building,
      },
    },
    {
      $project: {
        fee: 1,
        feeNotifications: 1,
      },
    },
    {
      $unwind: '$feeNotifications',
    },
    {
      $lookup: {
        from: 'feetypes',
        localField: 'feeNotifications.code',
        foreignField: 'code',
        as: 'feeType',
      },
    },
  ]).cursor().exec();
  return settings;
};

export default () => async (req, res) => {
  const buildingDocs = await BuildingServices.Model.find({
    isPublished: true,
    $or: [
      {
        isDeleted: {
          $exists: false,
        },
      },
      {
        isDeleted: false,
      },
    ],
  }).select('_id');

  buildingDocs.forEach(async (building) => {
    try {
      const settings = await getBuildingFeeSettings(building._id);
      settings.forEach((setting) => {
        const { automatedReminderAfterHowDays, timeLimitationBetween2FeeNotifications } = setting.fee;
        if (automatedReminderAfterHowDays < 1) {
          return;
        }

        const feeDeadline = moment(setting.feeNotifications.deadline);
        const now = moment();
        if (feeDeadline.isValid() && now > feeDeadline.clone().add(automatedReminderAfterHowDays, 'days')) {
          // Find all unfinished apartments paid fee
          FeeModel.find({
            building,
            status: UNPAID,
            deadline: {
              $gte: feeDeadline.clone().utc().startOf('day'),
              $lte: feeDeadline.clone().utc().endOf('day'),
            },
          }, (err, fees) => {
            if (err) {
              logger.log('error', err);
              return;
            }

            // When all apartments have done paid fee
            if (fees.length === 0) {
              BuildingSettingsService.Model.update(
                {
                  building: building._id,
                }, {
                  $pull: {
                    feeNotifications: {
                      deadline: setting.feeNotifications.deadline,
                      code: setting.feeNotifications.code,
                    },
                  },
                },
                () => undefined,
              );
              return;
            }

            fees.forEach((fee) => {
              try {
                // Determine whether the reminder should be sent
                if (fee.latestReminder) {
                  const latestReminder = moment(fee.latestReminder);
                  if (now <= latestReminder.clone().add(timeLimitationBetween2FeeNotifications, 'days')) {
                    return;
                  }
                }

                // Sending reminder and update flag latest reminder for apartment
                FeeModel.findOneAndUpdate({
                  _id: fee._id,
                }, {
                  $set: {
                    latestReminder: now.clone().endOf('day').toISOString(),
                  },
                }, {
                  new: true,
                }, () => {
                  sendRemindFeeNotification({
                    apartment: fee.apartment,
                    month: fee.month,
                    year: fee.year,
                    text: `Lời nhắc nộp tiền ${fee.type.name.toString().toLowerCase()} tháng ${fee.month}/${fee.year}`,
                  });
                });
              } catch (e) {
                logger.log('error', e);
              }
            });
          });
        }
      });
    } catch (e) {
      logger.log('error', e);
    }
  });

  return res.json(buildingDocs);
};
