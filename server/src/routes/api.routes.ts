// src/routes/api.routes.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import lessonRoutes from './lesson.routes';
import shopRoutes from './shop.routes';
import inventoryRoutes from './inventory.routes';
import studyRoutes from './study.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';
import raidRoutes from './raid.routes';
import clanRoutes from './clan.routes';
import rankingRoutes from './ranking.routes';
import towerRoutes from './tower.routes';

const router = Router();

// Prefijo: /auth
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/courses', courseRoutes);
router.use('/lessons', lessonRoutes);
router.use('/shop', shopRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/study', studyRoutes);
router.use('/user', userRoutes);
router.use('/raids', raidRoutes);
router.use('/clans', clanRoutes);
router.use('/ranking', rankingRoutes);
router.use('/tower', towerRoutes);

export default router;