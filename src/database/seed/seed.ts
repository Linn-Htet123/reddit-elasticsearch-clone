/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/database/seed/seed.ts
import { Client } from '@elastic/elasticsearch';
import AppDataSource from '../../config/typeorm-migration.config';

// Initialize Elastic Client with credentials from your docker-compose
const esClient = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: 'H7M2ObIj0C=zGXSzIPeW',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const seed = async () => {
  console.log('🌱 Connecting to database...');

  const dataSource = await AppDataSource.initialize();

  try {
    // --- CLEANUP ---
    console.log('🧹 Clearing old data...');

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
            subredditId: { type: 'integer' },
            flair: { type: 'keyword' },
            authorId: { type: 'integer' },
            authorUsername: { type: 'keyword' },
            createdAt: { type: 'date' },
            upvotes: { type: 'integer' },
            downvotes: { type: 'integer' },
            commentCount: { type: 'integer' },
          },
        },
      });
      console.log('✅ Elasticsearch index created');
    } catch (e) {
      console.log('⚠️ Elastic cleanup/creation note:', e.message);
    }

    //
    // 1. USERS (Diverse mix of Reddit archetypes)
    //
    console.log('Creating Users...');
    const users = [
      ['MovieBuff99', 'movie@example.com', 12000],
      ['GymRat_Official', 'lift@example.com', 500],
      ['CatLover_Xx', 'meow@example.com', 45000],
      ['PoliticsJunkie', 'news@example.com', 200],
      ['TravelGuru', 'travel@example.com', 8900],
      ['Throwaway_12345', 'anon@example.com', 10],
      ['ChefBoy', 'cook@example.com', 3200],
      ['Gamer4Life', 'game@example.com', 7500],
      ['ScienceNerd', 'sci@example.com', 1500],
      ['CryptoKing__', 'btc@example.com', -50], // Negative karma joke
    ];

    for (const user of users) {
      await dataSource.query(
        `INSERT INTO users (username, email, karma) VALUES ($1, $2, $3)`,
        user,
      );
    }
    console.log('✅ Users inserted');

    //
    // 2. SUBREDDITS (General interest categories)
    //
    console.log('Creating Subreddits...');
    const subreddits = [
      [
        'funny',
        'r/funny',
        "Welcome to r/Funny, Reddit's largest humour depository.",
        40000000,
      ],
      [
        'AskReddit',
        'r/AskReddit',
        'r/AskReddit is the place to ask and answer thought-provoking questions.',
        35000000,
      ],
      [
        'gaming',
        'r/gaming',
        'A subreddit for (almost) anything related to games.',
        30000000,
      ],
      [
        'worldnews',
        'r/worldnews',
        'Major news from around the world.',
        25000000,
      ],
      [
        'movies',
        'r/movies',
        'News & Discussion about Major Motion Pictures.',
        22000000,
      ],
    ];

    for (const sub of subreddits) {
      await dataSource.query(
        `INSERT INTO subreddits (name, display_name, description, subscriber_count) VALUES ($1, $2, $3, $4)`,
        sub,
      );
    }
    console.log('✅ Subreddits inserted');

    //
    // 3. POSTS (Mixed topics logic)
    //
    console.log('Creating Posts...');

    // We repurpose 'techs' as 'Subjects'
    const subjects = [
      'The new Marvel movie',
      'Tipping culture in the US',
      'Elden Ring DLC',
      'Artificial Intelligence',
      "My neighbor's dog",
      'The current economy',
      'Pineapple on pizza',
      'Remote work',
      'Climate change',
      'Social Media',
    ];

    // We repurpose 'topics' as 'Predicates/Opinions'
    const predicates = [
      'is actually overrated',
      'ruined my life today',
      'is the best thing ever created',
      'needs to be banned immediately',
      'is a total scam',
      'makes absolutely no sense',
      'is getting out of control',
      'changed my perspective on life',
      "is why we can't have nice things",
      'deserves more attention',
    ];

    const flairOptions = [
      'Discussion',
      'Humor',
      'News',
      'Question',
      'Rant',
      null,
    ];

    // Must match the order of 'subreddits' array above to align IDs correctly
    const subNames = ['funny', 'AskReddit', 'gaming', 'worldnews', 'movies'];

    const rawSubreddits = await dataSource.query(
      `SELECT subreddit_id FROM subreddits`,
    );
    const rawUsers = await dataSource.query(
      `SELECT user_id, username FROM users`,
    );

    const subredditIds = rawSubreddits.map((s: any) => s.subreddit_id);
    const userIds = rawUsers.map((u: any) => u.user_id);
    const usernameMap = new Map(
      rawUsers.map((u: any) => [u.user_id, u.username]),
    );

    let postCount = 0;
    const esOperations: Array<Record<string, any>> = [];

    // Generate posts with varying dates (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const subject of subjects) {
      for (const predicate of predicates) {
        // Constructing a natural language title
        const title = `${subject} ${predicate}`;

        // Generic content template that fits almost any topic
        const content = `I've been thinking about **${subject}** a lot recently.
        
To be honest, I think it ${predicate}. I know this might be a controversial opinion on this sub, but hear me out.

1. The way the media portrays it is misleading.
2. Everyone seems to just accept it without questioning.
3. My personal experience has been completely different from the norm.

Does anyone else feel this way? Or am I just going crazy?

Edit: Thanks for the gold, kind stranger!
Edit 2: RIP my inbox.`;

        const flair =
          flairOptions[Math.floor(Math.random() * flairOptions.length)];

        // Assign to a random subreddit from our list
        const subIndex = Math.floor(Math.random() * subredditIds.length);
        const subId = subredditIds[subIndex];
        const subName = subNames[subIndex];

        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        const username = usernameMap.get(userId);

        // Random date within last 30 days
        const randomTime =
          thirtyDaysAgo.getTime() +
          Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
        const createdAt = new Date(randomTime);

        // Realistic vote counts (some high, some low)
        const upvotes = Math.floor(Math.random() * 12000) + 50;
        const downvotes = Math.floor(Math.random() * 500);

        // Insert into Postgres
        const result = await dataSource.query(
          `
          INSERT INTO posts (title, content, post_type, flair, upvotes, downvotes, created_at, "subredditSubredditId", "authorUserId")
          VALUES ($1, $2, 'text', $3, $4, $5, $6, $7, $8)
          RETURNING post_id
          `,
          [title, content, flair, upvotes, downvotes, createdAt, subId, userId],
        );

        const newPostId = result[0].post_id;

        // Sync to Elastic
        esOperations.push(
          { index: { _index: 'posts', _id: newPostId.toString() } },
          {
            title,
            content,
            flair,
            subreddit: subName,
            subredditId: subId,
            authorId: userId,
            authorUsername: username,
            createdAt: createdAt,
            upvotes,
            downvotes,
            commentCount: 0,
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

    console.log(`✅ ${postCount} Posts inserted`);

    //
    // 4. COMMENTS (Generic Reddit replies)
    //
    console.log('Creating Comments...');
    const uniqueComments = [
      'This.',
      'Big if true.',
      'Source: trust me bro.',
      'I came here to say this.',
      'Underrated comment.',
      'Who asked?',
      'Take my upvote and get out.',
      'This has been reposted 100 times.',
      'Wholesome content right here.',
      'I was today years old when I learned this.',
      'Can confirm, I was the pizza.',
      'Why is this so accurate?',
      'Sir, this is a Wendys.',
      'Fake news.',
      'Instructions unclear, got stuck in a toaster.',
      'As a lawyer, I advise you to delete this.',
      'OP is a bot.',
      'Sort by controversial if you want to see the real comments.',
      'Mom get the camera!',
      'F in the chat.',
    ];

    // Track comment counts per post
    const commentCounts = new Map<number, number>();

    // Create 200 comments distributed across posts
    for (let i = 0; i < 200; i++) {
      const text =
        uniqueComments[Math.floor(Math.random() * uniqueComments.length)];
      const postId = Math.floor(Math.random() * postCount) + 1;
      const userId = userIds[Math.floor(Math.random() * userIds.length)];

      // Track comment count
      commentCounts.set(postId, (commentCounts.get(postId) || 0) + 1);

      await dataSource.query(
        `INSERT INTO comments (text, upvotes, downvotes, "postPostId", "authorUserId") VALUES ($1, $2, $3, $4, $5)`,
        [
          text,
          Math.floor(Math.random() * 500),
          Math.floor(Math.random() * 50),
          postId,
          userId,
        ],
      );
    }
    console.log('✅ 200 Comments inserted');

    //
    // 5. UPDATE ELASTICSEARCH WITH COMMENT COUNTS
    //
    console.log('Updating comment counts in Elasticsearch...');
    const updateOperations: Array<Record<string, any>> = [];

    for (const [postId, count] of commentCounts.entries()) {
      updateOperations.push(
        { update: { _index: 'posts', _id: postId.toString() } },
        { doc: { commentCount: count } },
      );
    }

    if (updateOperations.length > 0) {
      await esClient.bulk({ operations: updateOperations });
      console.log('✅ Comment counts updated in Elasticsearch');
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await dataSource.destroy();
    console.log('👋 Connection closed');
  }
};

seed();
