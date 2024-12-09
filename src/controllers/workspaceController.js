import { StatusCodes } from 'http-status-codes';

import {
  createWorkspaceService,
  getWorkspaceUserIsMemberOfService
} from '../services/workspaceService.js';
import {
  customErrorResponse,
  internalErrorResponse,
  successResponse
} from '../utils/common/responseObject.js';

// This code is likely used in a RESTful API, It handles a request to create a new workspace
export const createWorkspaceController = async (req, res) => {
  try {
    const response = await createWorkspaceService({
      ...req.body,
      owner: req.user
    });

    return res
      .status(StatusCodes.CREATED)
      .json(successResponse(response, 'Workspace created successfully'));
  } catch (error) {
    console.log(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const getWorkspaceUserIsMemberOfController = async (req, res) => {
  try {
    const response = await getWorkspaceUserIsMemberOfService(req.user);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Workspaces fetched successfully'));
  } catch (error) {
    console.log(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse, 'Internal Server Error');
  }
};
