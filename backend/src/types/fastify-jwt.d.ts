import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyInstance {
    jwt: {
      sign(payload: object, options?: import('@fastify/jwt').SignOptions): string;
      verify<T = any>(token: string): T;
      decode(token: string): any;
    };
  }

  interface FastifyRequest {
    jwtVerify<T = any>(): Promise<T>;
  }
}
