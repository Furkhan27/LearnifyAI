import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function registerAuthMiddleware(app: FastifyInstance) {
  // Register the JWT plugin
  app.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'super-secret-key',
  });

  // Add a decorator to generate JWT tokens
  app.decorate('generateToken', (payload: object) => {
    return app.jwt.sign(payload, { expiresIn: '1h' });
  });

  // Create a reusable authentication hook
  app.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.code(401).send({ message: 'Unauthorized' });
      }
    }
  );
}

// Extend FastifyInstance to include our custom methods
declare module 'fastify' {
  interface FastifyInstance {
    generateToken(payload: object): string;
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }
}
