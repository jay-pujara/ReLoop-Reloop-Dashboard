import { Router, Request, Response } from 'express';
import { impactService } from '../../services/impact.service.js';

const router = Router();

// Standard grading criteria endpoint for packaging types
router.get('/criteria', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      cardboard: ['Grade A (Clean OCC, baled)', 'Grade B (Die-cut overstock)', 'Grade C (Mixed industrial scrap)'],
      plastic: ['Type 4 LDPE Clean Film', 'Type 2 HDPE Rigid Totes', 'Type 5 PP Strapping'],
      pallets: ['Grade A (GMA 48x40 heat treated)', 'Grade B (Reconditioned)', 'Euro EPAL spec', 'Plastic runner'],
    },
  });
});

// Quality evaluation endpoint
router.post('/evaluate', (req: Request, res: Response) => {
  const { materialType, condition, contaminationPercentage = 0 } = req.body;
  let grade = 'Grade B';
  let circularAcceptability = true;

  if (condition === 'new' && contaminationPercentage < 1) {
    grade = 'Grade A+ (Direct Reuse)';
  } else if (contaminationPercentage > 15) {
    grade = 'Grade D (Degraded - Reprocessing Needed)';
    circularAcceptability = false;
  }

  res.json({
    success: true,
    data: {
      materialType,
      grade,
      circularAcceptability,
      recommendedProcess: circularAcceptability ? 'Direct reuse or return' : 'Secondary recycling',
    },
  });
});

// Carbon emission estimation endpoint
router.post('/carbon-estimate', (req: Request, res: Response) => {
  const { materialType, quantity, unit } = req.body;
  const metrics = impactService.calculateImpact({ materialType, quantity: Number(quantity) || 0, unit });
  res.json({
    success: true,
    data: metrics,
  });
});

export const intelligenceRoutes = router;
