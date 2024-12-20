import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

import channelRepository from '../repositories/channelRepository.js';
import userRepository from '../repositories/userRepository.js';
import workspaceRepository from '../repositories/workspaceRepository.js';
import ClientError from '../utils/error/clientError.js';
import ValidationError from '../utils/error/validationError.js';

// This function checks if a user with the given userId is an admin of a specific workspace
const isUserAdminOfWorkspace = async (workspace, userId) => {
  console.log(workspace.members, userId);

  const response = workspace.members.find(
    (member) =>
      (member.memberId.toString() === userId ||
        member.memberId._id.toString() === userId) &&
      member.role === 'admin'
  );
  console.log(response);
  return response;
};

const isUserMemberOfWorkspace = async (workspace, userId) => {
  return workspace.members.find(
    (member) => member.memberId.toString() === userId
  );
};

const isChannelIsPartOfWorkspace = async (workspace, channelName) => {
  return workspace.channels.find(
    (channel) => channel.name.toLowerCase() === channelName.toLowerCase()
  );
};

export const createWorkspaceService = async (workspaceData) => {
  try {
    console.log('Workspace data received in service:', workspaceData); // Log workspaceData here

    const joinCode = uuidv4().substring(0, 6).toUpperCase();

    if (!workspaceData.workspaceId) {
      console.log('No workspaceId found. Generating a new workspaceId...');
      workspaceData.workspaceId = uuidv4(); // Generate a new workspaceId if it's missing
    }

    const response = await workspaceRepository.create({
      workspaceId: workspaceData.workspaceId,
      name: workspaceData.name,
      description: workspaceData.description,
      joinCode
    });

    // Log response from the workspaceRepository.create we get all detail
    console.log('Workspace created, response:', response);

    await workspaceRepository.addMemberToWorkspace(
      response._id,
      workspaceData.owner,
      'admin'
    );

    const updatedWorkspace = await workspaceRepository.addChannelToWorkspace(
      response._id,
      'general'
    );

    return updatedWorkspace;
  } catch (error) {
    console.log('Create workspace service error', error);
    if (error.name === 'ValidationError') {
      throw new ValidationError(
        {
          error: error.errors
        },
        error.message
      );
    }
    if (error.name === 'MongoServerError' && error.code === 11000) {
      throw new ValidationError(
        {
          error: ['A workspace with same details already exists']
        },
        'A workspace with same details already exists'
      );
    }
    throw error;
  }
};

export const getWorkspaceUserIsMemberOfService = async (userId) => {
  try {
    const response =
      await workspaceRepository.fetchAllWorkspaceByMemberId(userId);
    return response;
  } catch (error) {
    console.log('get workspace user is member of service error', error);
    throw error;
  }
};

export const deleteWorkspaceService = async (workspaceId, userId) => {
  try {
    const workspace = await workspaceRepository.getById(workspaceId);

    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    console.log(workspace.members, userId);

    const isAllowed = isUserAdminOfWorkspace(workspace, userId);

    if (isAllowed) {
      await channelRepository.deleteMany(workspace.channels);

      const response = await workspaceRepository.delete(workspaceId);
      return response;
    }

    throw new ClientError({
      explanation: 'User is either not a memeber or an admin of the workspace',
      message: 'User is not allowed to delete the workspace',
      statusCode: StatusCodes.UNAUTHORIZED
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getWorkspaceService = async (workspaceId, userId) => {
  try {
    const workspace = await workspaceRepository.getById(workspaceId);

    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    const isMember = isUserMemberOfWorkspace(workspace, userId);

    if (!isMember) {
      throw new ClientError({
        explanation: 'User already member of workspace',
        message: 'User not already member of the work space',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }

    return workspace;
  } catch (error) {
    console.log('Get workspace service error', error);
    throw error;
  }
};
export const getWorkspaceByJoinCodeService = async (joinCode, userId) => {
  try {
    const workspace =
      await workspaceRepository.getWorkspaceByJoinCode(joinCode);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const isMember = isUserMemberOfWorkspace(workspace, userId);
    if (!isMember) {
      throw new ClientError({
        explanation: 'User is not a member of the workspace',
        message: 'User is not a member of the workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    return workspace;
  } catch (error) {
    console.log('Get workspace by join code service error', error);
    throw error;
  }
};

export const updateWorkspaceService = async (
  workspaceId,
  workspaceData,
  userId
) => {
  try {
    console.log('Starting updateWorkspaceService with:', {
      workspaceId,
      workspaceData,
      userId
    });

    const workspace = await workspaceRepository.getById(workspaceId);

    console.log('workspace', workspace);

    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const isAdmin = isUserAdminOfWorkspace(workspace, userId);
    if (!isAdmin) {
      throw new ClientError({
        explanation: 'User is not an admin of the workspace',
        message: 'User is not an admin of the workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    const updatedWorkspace = await workspaceRepository.update(
      workspaceId,
      workspaceData
    );

    console.log(
      'updated workspace for update work space service',
      updatedWorkspace
    );

    return updatedWorkspace;
  } catch (error) {
    console.log('update workspace service error', error);
    throw error;
  }
};

export const addMemberToWorkspaceService = async (
  workspaceId,
  memberId,
  role,
  userId
) => {
  try {
    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    const isAdmin = isUserAdminOfWorkspace(workspace, userId);
    if (!isAdmin) {
      throw new ClientError({
        explanation: 'User is not an admin of the workspace',
        message: 'User is not an admin of the workspace',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    const isValidUser = await userRepository.getById(memberId);
    if (!isValidUser) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    console.log('add channel to workSpace', workspaceId, userId);
    const isMember = await isUserMemberOfWorkspace(workspaceId, memberId);
    if (!isMember) {
      throw new ClientError({
        explanation: 'User not member of workspace',
        message: 'User is not membet of the work space',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    console.log('add channel to workspace', workspaceId, memberId);

    const response = await workspaceRepository.addMemberToWorkspace(
      workspaceId,
      memberId,
      role
    );
    return response;
  } catch (error) {
    console.log('Add Member To Workspace service error', error);
    throw error;
  }
};

export const addChannelToWorkspaceService = async (
  workspaceId,
  userId,
  channelName
) => {
  try {
    const workspace =
      await workspaceRepository.getWorkspaceDetailsById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    const isAdmin = await isUserMemberOfWorkspace(workspace, userId);
    if (!isAdmin) {
      throw new ClientError({
        explanation: 'User is not admin of the workspace',
        message: 'User is  not admin of the work space',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }

    const isChannelAlreadyPartOfWorkspace = isChannelIsPartOfWorkspace(
      workspaceId,
      channelName
    );

    if (!isChannelAlreadyPartOfWorkspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'channel is already part of workspace',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    const response = await workspaceRepository.addChannelToWorkspace(
      workspaceId,
      channelName
    );

    return response;
  } catch (error) {
    console.log('Add channel to workspace service error', error);
    throw error;
  }
};
