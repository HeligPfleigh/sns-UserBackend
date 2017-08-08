import express from 'express';
import BuildingServices from '../data/apis/BuildingServices';

const router = express.Router();

router.get('/buildingwithapartment', async (req, res) => {
  const page = req.query.page || 1;
  const q = req.query.q;
  if (!q) {
    // res.status(403).send('No search text');
    return res.json([]);
  }
  const buildings = await BuildingServices.getBuildingWithApartments(page, q);
  return res.json(buildings);
});

export default router;
