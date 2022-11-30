import fastify from 'fastify';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import sensible from '@fastify/sensible';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
dotenv.config();

const server = fastify();
server.register(sensible);
server.register(cookie, { secret: process.env.COOKIE_SECRET });
server.register(cors, {
  origin: process.env.CLIENT_URL,
  credentials: true,
});
server.addHook('onRequest', (req, res, done) => {
  if (req.cookies.userId !== CURRENT_USER_ID) {
    req.cookies.userId = CURRENT_USER_ID;
    res.clearCookie('userId');
    res.setCookie('userId', CURRENT_USER_ID);
  }
  done();
});
const prisma = new PrismaClient();
const CURRENT_USER_ID = (
  await prisma.user.findFirst({ where: { name: 'Josh' } })
).id;

const COMMENT_SELECT_FIELD = {
  id: true,
  message: true,
  parentId: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
};

server.get('/posts', async (req, res) => {
  return await commitToDb(
    prisma.post.findMany({
      select: {
        id: true,
        title: true,
      },
    })
  );
});

server.get('/posts/:id', async (req, res) => {
  return await commitToDb(
    prisma.post.findUnique({
      where: {
        id: req.params.id,
      },
      select: {
        body: true,
        title: true,
        comments: {
          orderBy: {
            createdAt: 'desc',
          },
          select: COMMENT_SELECT_FIELD,
        },
      },
    })
  );
});

server.post('/posts/:id/comments', async (req, res) => {
  if (req.body.message === '' || req.body.message == null) {
    return res.send(server.httpErrors.badRequest('Message is required'));
  }

  return await commitToDb(
    prisma.comment.create({
      data: {
        message: req.body.message,
        userId: req.cookies.userId,
        parentId: req.body.parentId,
        postId: req.params.id,
      },
      select: COMMENT_SELECT_FIELD,
    })
  );
});

server.put('/posts/:id/comments/:commentId', async (req, res) => {
  if (req.body.message === '' || req.body.message == null) {
    return res.send(server.httpErrors.badRequest('Message is required'));
  }

  const { userId } = await prisma.comment.findUnique({
    where: { id: req.params.commentId },
    select: { userId: true },
  });
  if (userId !== req.cookies.userId) {
    return res.send(
      server.httpErrors.unauthorized(
        'You do not have permission to edit this message'
      )
    );
  }

  return await commitToDb(
    prisma.comment.update({
      where: { id: req.params.commentId },
      data: { message: req.body.message },
      select: { message: true },
    })
  );
});

server.delete('/posts/:id/comments/:commentId', async (req, res) => {
  const { userId } = await prisma.comment.findUnique({
    where: { id: req.params.commentId },
    select: { userId: true },
  });
  if (userId !== req.cookies.userId) {
    return res.send(
      server.httpErrors.unauthorized(
        'You do not have permission to delete this message'
      )
    );
  }

  return await commitToDb(
    prisma.comment.delete({
      where: { id: req.params.commentId },
      select: { id: true },
    })
  );
});

async function commitToDb(promise) {
  const [err, data] = await server.to(promise);
  if (err) {
    return server.httpErrors.internalServerError(err.message);
  }
  return data;
}

server.listen({ port: process.env.PORT });
