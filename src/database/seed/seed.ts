// src/database/seed/seed.ts
import AppDataSource from '../../config/typeorm-migration.config'; // 👈 Ensure this path points to your config

const seed = async () => {
  console.log('🌱 Connecting to database...');

  // 1. Initialize the connection
  const dataSource = await AppDataSource.initialize();

  try {
    console.log('🧹 Clearing old data...');
    // Delete in reverse order to avoid Foreign Key constraints
    await dataSource.query(`DELETE FROM comments`);
    await dataSource.query(`DELETE FROM posts`);
    await dataSource.query(`DELETE FROM subreddits`);
    await dataSource.query(`DELETE FROM users`);

    //
    // 1. USERS
    //
    console.log('Creating Users...');
    const users = [
      ['techguru', 'techguru@example.com', 1200],
      ['coderlife', 'coderlife@example.com', 800],
      ['dailydev', 'dailydev@example.com', 500],
      ['frontend_fan', 'frontend@example.com', 350],
      ['backend_master', 'backend@example.com', 900],
      ['dev_addict', 'devaddict@example.com', 240],
      ['typescript_pro', 'tspro@example.com', 600],
      ['bughunter', 'bughunter@example.com', 100],
      ['opensource_guy', 'oss@example.com', 780],
      ['stackwizard', 'stackwizard@example.com', 320],
    ];

    for (const user of users) {
      await dataSource.query(
        `INSERT INTO users (username, email, karma) VALUES ($1, $2, $3)`,
        user,
      );
    }
    console.log('✅ Users inserted');

    //
    // 2. SUBREDDITS
    //
    console.log('Creating Subreddits...');
    const subreddits = [
      ['javascript', 'r/javascript', 'Everything related to JS.', 2300000],
      ['programming', 'r/programming', 'Discussions about coding.', 4500000],
      ['webdev', 'r/webdev', 'Frontend, backend, and DevOps.', 1700000],
      ['reactjs', 'r/reactjs', 'React ecosystem discussions.', 1300000],
      ['node', 'r/node', 'Node.js news and libraries.', 900000],
    ];

    for (const sub of subreddits) {
      await dataSource.query(
        `INSERT INTO subreddits (name, display_name, description, subscriber_count) VALUES ($1, $2, $3, $4)`,
        sub,
      );
    }
    console.log('✅ Subreddits inserted');

    //
    // 3. POSTS
    //
    console.log('Creating Posts...');
    const techs = [
      'React',
      'Node.js',
      'TypeScript',
      'PostgreSQL',
      'Docker',
      'Next.js',
      'GoLang',
      'Rust',
      'GraphQL',
      'Kubernetes',
    ];
    const topics = [
      'Beginner Guide 2025',
      'Advanced Performance Tips',
      'Common Mistakes to Avoid',
      'Interview Questions & Answers',
      'Why I stopped using it',
      'The Future of this Tech',
      'How to scale to 1M users',
      'Best Libraries Ecosystem',
      'Configuration & Setup Tutorial',
      'Production Ready Best Practices',
    ];

    const flairOptions = ['Discussion', 'Help', 'Guide', 'Release', null];
    // fetching IDs dynamically would be safer, but hardcoding works if tables were empty
    const subredditIds = [1, 2, 3, 4, 5];
    const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let postCount = 0;

    for (const tech of techs) {
      for (const topic of topics) {
        const title = `${tech}: ${topic}`;
        const content = `This post discusses ${topic} regarding ${tech}. We explore the pros, cons, and code examples. Validated for the year 2025.`;
        const flair =
          flairOptions[Math.floor(Math.random() * flairOptions.length)];
        const subId =
          subredditIds[Math.floor(Math.random() * subredditIds.length)];
        const userId = userIds[Math.floor(Math.random() * userIds.length)];

        await dataSource.query(
          `
          INSERT INTO posts (title, content, post_type, flair, upvotes, downvotes, "subredditSubredditId", "authorUserId")
          VALUES ($1, $2, 'text', $3, $4, $5, $6, $7)
          `,
          [
            title,
            content,
            flair,
            Math.floor(Math.random() * 500),
            Math.floor(Math.random() * 50),
            subId,
            userId,
          ],
        );
        postCount++;
      }
    }
    console.log(`✅ ${postCount} Unique Posts inserted`);

    //
    // 4. COMMENTS
    //
    console.log('Creating Comments...');
    const uniqueComments = [
      'This is exactly what I was looking for, thanks!',
      'I strongly disagree with point #3.',
      'Does this work on Windows?',
      'Can you share the GitHub repo?',
      "This is the best explanation I've seen all week.",
      'Underrated post, needs more upvotes.',
      'I tried this in production and it crashed.',
      'For anyone asking, yes this supports version 18.',
      'Documentation is quite unclear on this part.',
      'Wow, I never knew that existed.',
      'Could you elaborate on the performance impact?',
      'Saved for later reading.',
      'This is outdated, check the new docs.',
      'Rust does this better... just saying.',
      'Javascript fatigue is real.',
      'I love how clean this code looks.',
      'Any alternative for Python users?',
      'This solved my bug after 4 hours of debugging!',
      'Repost from last year?',
      'Great tutorial for beginners.',
      'Technically true, but practically difficult.',
      'What theme are you using in the screenshots?',
      'First!',
      'Is this free to use?',
      'The formatting on mobile is broken.',
      'I would suggest using Redis for caching here.',
      "Don't forget to run npm install.",
      'Works on my machine.',
      'TypeORM is tricky with relationships.',
      'NestJS architecture is superior.',
      'Why not just use a simple fetch?',
      'I think you missed an edge case.',
      'Can we get a video tutorial?',
      'Awesome work, keep it up!',
      'I found a typo in the second paragraph.',
      'Please add a TL;DR.',
      'This changed my perspective on closures.',
      'Backend development is getting complex.',
      'Frontend is harder than backend, fight me.',
      'Docker makes this so much easier.',
      'How do you handle authentication?',
      'Is there a library for this?',
      'Good job.',
      'Terrible advice, do not do this.',
      'Interesting take.',
      'Marking this as solved.',
      'Checking in from 2025.',
      'Who is hiring for this stack?',
      'My linter is screaming at this code.',
      'Finally, some good content.',
    ];

    for (let i = 0; i < 50; i++) {
      const text = uniqueComments[i];
      const postId = Math.floor(Math.random() * 100) + 1;
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const parent =
        Math.random() > 0.8 ? Math.floor(Math.random() * i) + 1 : null;

      await dataSource.query(
        `
        INSERT INTO comments (text, upvotes, downvotes, "postPostId", "parentCommentCommentId", "authorUserId")
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          text,
          Math.floor(Math.random() * 100),
          Math.floor(Math.random() * 20),
          postId,
          parent,
          userId,
        ],
      );
    }
    console.log('✅ 50 Unique Comments inserted');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    // 5. Close the connection
    await dataSource.destroy();
    console.log('👋 Connection closed');
  }
};

// ⚡️ EXECUTE THE FUNCTION
seed();
