import express from 'express';
import BuildingServices from '../data/apis/BuildingServices';

const router = express.Router();

router.get('/buildingwithapartment', async (req, res) => {
  const page = req.query.page || 1;
  const buildings = await BuildingServices.getBuildingWithApartments(page);
  res.json(buildings);
});

export default router;
