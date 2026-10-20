import { Router } from 'express';

const router = Router();

// Static MVP categories matching requirements: Cardboard, Plastic, Pallets
const MVP_CATEGORIES = [
  {
    id: 'cardboard',
    name: 'Cardboard',
    description: 'Corrugated boxes, sheets, industrial packaging tubes, and baled OCC',
    subcategories: ['OCC (Old Corrugated Containers)', 'Die-Cut Boxes', 'Cardboard Pallets', 'Industrial Rolls'],
  },
  {
    id: 'plastic',
    name: 'Plastic',
    description: 'Stretch film, LDPE wraps, HDPE containers, plastic totes and crates',
    subcategories: ['LDPE Stretch Film', 'HDPE Crates & Totes', 'Polypropylene Strapping', 'Rigid Drums'],
  },
  {
    id: 'pallets',
    name: 'Pallets',
    description: 'Standard wooden pallets, heat-treated Euro pallets, and heavy-duty plastic skids',
    subcategories: ['Wooden Pallets (48x40)', 'Euro Pallets (EPAL)', 'Plastic Skids', 'Reversible Heavy Duty'],
  },
];

router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: MVP_CATEGORIES,
  });
});

export const categoriesRoutes = router;
