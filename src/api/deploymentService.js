import { api } from './apiClient';

const NOTIFICATIONS_STORAGE_PREFIX = 'opsflow_notifications_';

function getNotificationKey(userId) {
  return `${NOTIFICATIONS_STORAGE_PREFIX}${userId}`;
}

function createLocalNotification({
  recipientId,
  requesterName,
  requesterId,
  recordId,
  project,
  environment,
}) {
  if (!recipientId) {
    return;
  }

  try {
    const key = getNotificationKey(recipientId);

    const existing = localStorage.getItem(key);
    const notifications = existing
      ? JSON.parse(existing)
      : [];

    const notification = {
      id: `DEP-NOT-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

      type: 'deployment',

      title: 'New Deployment Request',

      message: `${requesterName} submitted deployment request ${recordId}`,

      details: `${project || 'Project'} · ${environment || 'Environment'}`,

      requesterName,
      requesterId,

      recordId,

      link: `/deployments/${recordId}`,

      read: false,

      time: new Date().toLocaleString(),
    };

    const updated = [
      notification,
      ...notifications,
    ].slice(0, 100);

    localStorage.setItem(
      key,
      JSON.stringify(updated)
    );

    window.dispatchEvent(
      new CustomEvent(
        'opsflow_notifications_updated',
        {
          detail: {
            recipientId,
          },
        }
      )
    );

    window.dispatchEvent(
      new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(updated),
      })
    );
  } catch (error) {
    console.error(
      'Failed to create deployment notification:',
      error
    );
  }
}

export const deploymentService = {
  list(params = {}) {
    return api.get(
      'listRecords',
      {
        type: 'DEPLOYMENT',
        ...params,
      }
    );
  },

  get(id) {
    return api.get(
      'getRecord',
      { id }
    );
  },

  async create(fields, requester = null) {
    const response = await api.post(
      'createDeployment',
      { fields }
    );

    /*
     * Create notification for the selected DevOps user.
     */
    if (
      response?.record &&
      fields?.assignedDevOpsId
    ) {
      createLocalNotification({
        recipientId:
          fields.assignedDevOpsId,

        requesterName:
          requester?.name ||
          requester?.email ||
          requester?.id ||
          'A user',

        requesterId:
          requester?.id ||
          requester?.email ||
          '',

        recordId:
          response.record['Record ID'],

        project:
          response.record.Project ||
          fields.project,

        environment:
          response.record.Environment ||
          fields.environment,
      });
    }

    return response;
  },

  updateStatus(
    id,
    newStatus,
    reason
  ) {
    return api.post(
      'updateDeploymentStatus',
      {
        id,
        newStatus,
        reason,
      }
    );
  },

  reassign(
    id,
    newDevOpsId
  ) {
    return api.post(
      'reassignDeployment',
      {
        id,
        newDevOpsId,
      }
    );
  },

  softDelete(id) {
    return api.post(
      'softDeleteRecord',
      { id }
    );
  },
};