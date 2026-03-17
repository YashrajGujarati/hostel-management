import { Router, Response } from 'express';
import FoodMenu from '../models/FoodMenu';
import { AuthRequest, protect, adminOnly } from '../middleware/auth';

const router = Router();

// GET /api/food-menu — Get weekly food schedule
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const menu = await FoodMenu.findAll();
    const sorted = menu.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
    res.json(sorted);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// PUT /api/food-menu — Update food menu (admin only)
router.put('/', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { menu } = req.body; // array of { day, morning, afternoon, night }

    for (const item of menu) {
      const existing = await FoodMenu.findOne({ where: { day: item.day } });
      if (existing) {
        await existing.update({
          morning: item.morning,
          afternoon: item.afternoon,
          night: item.night
        });
      } else {
        await FoodMenu.create(item);
      }
    }

    const updatedMenu = await FoodMenu.findAll();
    res.json(updatedMenu);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
