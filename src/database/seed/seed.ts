/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/database/seed/seed.ts
import { Client } from '@elastic/elasticsearch'; // 👈 Import Elastic Client
import AppDataSource from '../../config/typeorm-migration.config';

// Initialize Elastic Client with credentials from your docker-compose
const esClient = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: 'H7M2ObIj0C=zGXSzIPeW', // Password from your docker-compose
  },
  tls: {
    rejectUnauthorized: false, // Local development often uses self-signed certs or http
  },
});

const seed = async () => {
  console.log('🌱 Connecting to database...');

  // 1. Initialize Postgres
  const dataSource = await AppDataSource.initialize();

  try {
    // --- CLEANUP ---
    console.log('🧹 Clearing old data...');

    // Clear Postgres
    console.log('🧹 Clearing old data...');

    // 👇 REPLACE your 4 DELETE lines with this ONE line:
    await dataSource.query(
      `TRUNCATE TABLE comments, posts, subreddits, users RESTART IDENTITY CASCADE`,
    );
    // Clear Elasticsearch Index
    try {
      const indexExists = await esClient.indices.exists({ index: 'posts' });
      if (indexExists) {
        await esClient.indices.delete({ index: 'posts' });
        console.log('🗑️  Old Elasticsearch index deleted');
      }

      // Create Index with simple mapping (optional, but good practice)
      // In your seed script or index creation
      await esClient.indices.create({
        index: 'posts',
        settings: {
          analysis: {
            analyzer: {
              ngram_analyzer: {
                type: 'custom',
                tokenizer: 'ngram_tokenizer',
                filter: ['lowercase'],
              },
            },
            tokenizer: {
              ngram_tokenizer: {
                type: 'ngram',
                min_gram: 3,
                max_gram: 20,
                token_chars: ['letter', 'digit'],
              },
            },
          },
        },
        mappings: {
          properties: {
            title: {
              type: 'text',
              analyzer: 'standard',
              fields: {
                ngram: {
                  type: 'text',
                  analyzer: 'ngram_analyzer',
                },
                keyword: {
                  type: 'keyword',
                },
              },
            },
            content: {
              type: 'text',
              analyzer: 'standard',
            },
            subreddit: { type: 'keyword' },
            flair: { type: 'keyword' },
          },
        },
      });
    } catch (e) {
      console.log('⚠️ Elastic cleanup/creation note:', e.message);
    }

    //
    // 1. USERS (Postgres Only)
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
    // 2. SUBREDDITS (Postgres Only)
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

    // ... inside the seed function ...

    //
    // 3. POSTS (Postgres AND Elasticsearch)
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
      'Interview Questions',
      'Why I stopped using it',
      'The Future of this Tech',
      'How to scale to 1M users',
      'Best Libraries Ecosystem',
      'Configuration & Setup',
      'Production Ready Best Practices',
    ];
    const flairOptions = ['Discussion', 'Help', 'Guide', 'Release', null];

    const subNames = ['javascript', 'programming', 'webdev', 'reactjs', 'node'];
    const rawSubreddits = await dataSource.query(
      `SELECT subreddit_id FROM subreddits`,
    );
    const rawUsers = await dataSource.query(`SELECT user_id FROM users`);

    // Map them to simple arrays of numbers: [6, 7, 8, 9, 10]
    const subredditIds = rawSubreddits.map((s: any) => s.subreddit_id);
    const userIds = rawUsers.map((u: any) => u.user_id);
    let postCount = 0;

    const esOperations: Array<Record<string, any>> = [];

    for (const tech of techs) {
      for (const topic of topics) {
        const title = `${tech}: ${topic}`;
        const content = `This post discusses ${topic} regarding ${tech}. We explore the pros, cons, and code examples. Validated for the year 2025.`;
        const flair =
          flairOptions[Math.floor(Math.random() * flairOptions.length)];

        const subIndex = Math.floor(Math.random() * subredditIds.length);
        const subId = subredditIds[subIndex];
        const subName = subNames[subIndex];

        const userId = userIds[Math.floor(Math.random() * userIds.length)];

        // 👇 FIX: Changed "RETURNING id" to "RETURNING post_id"
        const result = await dataSource.query(
          `
          INSERT INTO posts (title, content, post_type, flair, upvotes, downvotes, "subredditSubredditId", "authorUserId")
          VALUES ($1, $2, 'text', $3, $4, $5, $6, $7)
          RETURNING post_id
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

        // 👇 FIX: Access .post_id instead of .id
        const newPostId = result[0].post_id;

        esOperations.push(
          { index: { _index: 'posts', _id: newPostId.toString() } },
          {
            title,
            content,
            flair,
            subreddit: subName,
            subredditId: subId,
            authorId: userId,
            createdAt: new Date(),
          },
        );

        postCount++;
      }
    }
    // EXECUTE ELASTIC BULK INSERT
    if (esOperations.length > 0) {
      await esClient.bulk({ operations: esOperations });
      console.log(`🔎 Synced ${postCount} posts to Elasticsearch`);
    }

    console.log(`✅ ${postCount} Unique Posts inserted`);

    //
    // 4. COMMENTS (Postgres Only usually, unless you need deep comment search)
    //
    console.log('Creating Comments...');
    const uniqueComments = [
      'This is exactly what I was looking for, thanks!',
      'I strongly disagree.',
      'Does this work on Windows?',
      'Can you share the GitHub repo?',
      'Best explanation seen all week.',
      'Underrated post.',
      'Crashed in production.',
      'Supports version 18.',
      'Docs are unclear.',
      'Wow, never knew that.',
      // ... (your other comments)
    ];
    // *Just filling logical gap for shortening, keep your full list*

    for (let i = 0; i < 50; i++) {
      const text = uniqueComments[i] || 'Nice post!';
      const postId = Math.floor(Math.random() * 100) + 1;
      const userId = userIds[Math.floor(Math.random() * userIds.length)];

      await dataSource.query(
        `INSERT INTO comments (text, upvotes, downvotes, "postPostId", "authorUserId") VALUES ($1, $2, $3, $4, $5)`,
        [
          text,
          Math.floor(Math.random() * 100),
          Math.floor(Math.random() * 20),
          postId,
          userId,
        ],
      );
    }
    console.log('✅ 50 Unique Comments inserted');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await dataSource.destroy();
    console.log('👋 Connection closed');
  }
};

seed();
