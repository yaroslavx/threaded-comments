import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  const josh = await prisma.user.create({ data: { name: 'Josh' } });
  const sam = await prisma.user.create({ data: { name: 'Sam' } });

  const post1 = await prisma.post.create({
    data: {
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer placerat urna vel ante volutpat, ut elementum mi placerat.',
      title: 'Post 1',
    },
  });
  const post2 = await prisma.post.create({
    data: {
      body: 'Proin ut sollicitudin lacus. Mauris blandit, turpis in efficitur lobortis, lectus lacus dictum ipsum, vel pretium ex lacus id mauris.',
      title: 'Post 2',
    },
  });

  const comment1 = await prisma.comment.create({
    data: {
      message: 'I am a root comment',
      userId: josh.id,
      postId: post1.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      parentId: comment1.id,
      message: 'I am a nested comment',
      userId: sam.id,
      postId: post1.id,
    },
  });

  const comment3 = await prisma.comment.create({
    data: {
      message: 'I am another root comment',
      userId: sam.id,
      postId: post1.id,
    },
  });
}

seed();
