import express from 'express';

import {
  addMemberToWorkspaceController,
  createWorkspaceController,
  deleteWorkspaceController,
  getWorkspaceByJoinCodeController,
  getWorkspaceController,
  getWorkspaceUserIsMemberOfController,
  updateWorkspaceController
} from '../../controllers/workspaceController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';
import { createWorkspaceSchema } from '../../validators/workspaceSchema.js';
import { validation } from '../../validators/zodValidator.js';

const router = express.Router();

router.post(
  '/',
  isAuthenticated,
  validation(createWorkspaceSchema),
  createWorkspaceController
);

router.get('/', isAuthenticated, getWorkspaceUserIsMemberOfController);

router.delete('/:workspaceId', isAuthenticated, deleteWorkspaceController);

router.get('/:workspaceId', isAuthenticated, getWorkspaceController);

router.get(
  '/join/:joinCoide',
  isAuthenticated,
  getWorkspaceByJoinCodeController
);

router.put('/:workspaceId', isAuthenticated, updateWorkspaceController);

router.put(
  '/:workspaceId/member',
  isAuthenticated,
  addMemberToWorkspaceController
);

export default router;
