// prisma/seed.js
const { prisma } = require("../src/pages/api/auth/prisma");

async function main() {
  // 1. Clear out existing data in the right order (to avoid FK constraint issues)
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create 5 users
  console.log("Creating users...");

  const robin = await prisma.user.create({
    data: {
      username: "robin",
      email: "robin@example.com",
      passwordHash: "hashed_pw",
      bio: "Love birdwatching",
    },
  });

  const sparrow = await prisma.user.create({
    data: {
      username: "sparrow",
      email: "sparrow@example.com",
      passwordHash: "hashed_pw",
      bio: "Sparrows are life",
    },
  });

  const eagle = await prisma.user.create({
    data: {
      username: "eagle",
      email: "eagle@example.com",
      passwordHash: "hashed_pw",
      bio: "Soaring high",
    },
  });

  const owl = await prisma.user.create({
    data: {
      username: "owl",
      email: "owl@example.com",
      passwordHash: "hashed_pw",
      bio: "Night watcher",
    },
  });

  const finch = await prisma.user.create({
    data: {
      username: "finch",
      email: "finch@example.com",
      passwordHash: "hashed_pw",
      bio: "Small but mighty",
    },
  });

  // 3. Create posts:
  console.log("Creating posts...");

  // Robin → 4 posts
  const robinPosts = await Promise.all([
    prisma.post.create({
      data: {
        title: "Morning Walk",
        content: "Saw some robins chirping!",
        authorId: robin.id,
      },
    }),
    prisma.post.create({
      data: {
        title: "Afternoon Spot",
        content: "Noticed a woodpecker today.",
        authorId: robin.id,
      },
    }),
    prisma.post.create({
      data: {
        title: "Evening Watch",
        content: "Owls started calling at dusk.",
        authorId: robin.id,
      },
    }),
    prisma.post.create({
      data: {
        title: "Backyard Find",
        content: "A nest with eggs!",
        authorId: robin.id,
      },
    }),
  ]);

  // Sparrow → 2 posts
  const sparrowPosts = await Promise.all([
    prisma.post.create({
      data: {
        title: "City Birds",
        content: "Pigeons and sparrows at the park.",
        authorId: sparrow.id,
      },
    }),
    prisma.post.create({
      data: {
        title: "Evening Feed",
        content: "Fed the sparrows with grains.",
        authorId: sparrow.id,
      },
    }),
  ]);

  // Eagle → 1 post
  const eaglePost = await prisma.post.create({
    data: {
      title: "Mountain Flight",
      content: "Saw an eagle soaring over the mountains.",
      authorId: eagle.id,
    },
  });

  // 4. Create comments (4 total)
  console.log("Creating comments...");

  await prisma.comment.createMany({
    data: [
      {
        content: "Wow, sounds amazing!",
        postId: robinPosts[0].id, // first robin post
        authorId: sparrow.id,
      },
      {
        content: "Wish I saw that too!",
        postId: robinPosts[0].id, // same post as above
        authorId: eagle.id,
      },
      {
        content: "Great sighting!",
        postId: eaglePost.id,
        authorId: robin.id,
      },
      {
        content: "I love sparrows too!",
        postId: sparrowPosts[0].id,
        authorId: eagle.id,
      },
    ],
  });

  console.log("🌱 Database has been seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  });
