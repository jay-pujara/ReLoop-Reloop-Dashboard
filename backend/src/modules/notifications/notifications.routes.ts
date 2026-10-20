import { Router, Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { emailService } from '../../services/email.service.js';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await notificationsService.getForUser(req.user!.userId);
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await notificationsService.markAsRead(req.params.id, req.user!.userId);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

router.post('/send-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { to = 'xyz30102111@gmail.com', title, desc, link, date } = req.body;
    const sent = await emailService.sendEmail({
      to,
      subject: `[ReLoop Notification] ${title || 'Platform Alert'}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #111; max-width: 600px; border: 1px solid #eee; border-radius: 16px;">
          <h2 style="color: #7201FF; margin-top: 0;">ReLoop Platform Alert</h2>
          <div style="background-color: #f8f8fc; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
            <p style="font-size: 16px; font-weight: bold; margin: 0 0 8px 0;">${title || 'Alert'}</p>
            <p style="font-size: 14px; color: #444; margin: 0 0 8px 0;">${desc || ''}</p>
            <p style="font-size: 12px; color: #888; margin: 0;">Time: ${date || 'Just now'}</p>
          </div>
          ${link ? `<p><a href="${link}" style="display: inline-block; background-color: #7201FF; color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">View Alert in ReLoop</a></p>` : ''}
          <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 11px; color: #999; margin: 0;">Dispatched automatically to ${to}</p>
        </div>
      `,
    });
    res.json({ success: true, message: `Notification forwarded to ${to}`, sent });
  } catch (error) {
    next(error);
  }
});

export const notificationsRoutes = router;
