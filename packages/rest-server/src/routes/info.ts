import type { FastifyInstance } from 'fastify';

export default async function infoRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/info', async () => ({
    success: true,
    result: {
      specVersion: 'beta',
      serverVersion: '0.1.0',
      serverName: 'i3x2ua-node',
      capabilities: {
        query: { history: true },
        update: { current: true, history: false },
        subscribe: { stream: true },
      },
    },
  }));
}
