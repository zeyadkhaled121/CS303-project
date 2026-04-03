const notificationClients = new Map();

const toSseMessage = (event, payload) => {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
};

export const addNotificationClient = (userId, res) => {
  const existing = notificationClients.get(userId) || new Set();
  existing.add(res);
  notificationClients.set(userId, existing);
};

export const removeNotificationClient = (userId, res) => {
  const existing = notificationClients.get(userId);
  if (!existing) return;

  existing.delete(res);
  if (existing.size === 0) {
    notificationClients.delete(userId);
  }
};

export const publishNotificationEvent = (userId, event, payload = {}) => {
  const clients = notificationClients.get(userId);
  if (!clients || clients.size === 0) return;

  const message = toSseMessage(event, {
    userId,
    ts: Date.now(),
    ...payload
  });

  for (const res of clients) {
    try {
      res.write(message);
    } catch (error) {
      removeNotificationClient(userId, res);
      try {
        res.end();
      } catch {
        // no-op
      }
    }
  }
};

export const publishHeartbeat = (res) => {
  try {
    res.write(`: ping ${Date.now()}\n\n`);
  } catch {
    // no-op
  }
};
