import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedData1700000000000 implements MigrationInterface {
  name = 'SeedData1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    //
    // 1. USERS
    //
    await queryRunner.query(`
      INSERT INTO users (username, email, karma)
      VALUES
        ('techguru', 'techguru@example.com', 1200),
        ('coderlife', 'coderlife@example.com', 800),
        ('dailydev', 'dailydev@example.com', 500),
        ('frontend_fan', 'frontend@example.com', 350),
        ('backend_master', 'backend@example.com', 900),
        ('dev_addict', 'devaddict@example.com', 240),
        ('typescript_pro', 'tspro@example.com', 600),
        ('bughunter', 'bughunter@example.com', 100),
        ('opensource_guy', 'oss@example.com', 780),
        ('stackwizard', 'stackwizard@example.com', 320);
    `);

    //
    // 2. SUBREDDITS
    //
    await queryRunner.query(`
      INSERT INTO subreddits (name, display_name, description, subscriber_count)
      VALUES
        ('javascript', 'r/javascript', 'Everything related to JS.', 2300000),
        ('programming', 'r/programming', 'News & discussions about programming.', 4500000),
        ('webdev', 'r/webdev', 'Frontend, backend, devops, and more.', 1700000),
        ('reactjs', 'r/reactjs', 'Discussion about React, Next.js & ecosystem.', 1300000),
        ('node', 'r/node', 'Node.js news, libraries and best practices.', 900000);
    `);

    //
    // 3. POSTS (100 realistic posts)
    //
    const postTitles = [
      'How to optimize large React applications?',
      'Why Node.js is still great in 2025',
      'Understanding closures in JavaScript',
      'Best practices for scalable backend architecture',
      'Should I use Postgres or MongoDB for my next project?',
      '10 tips to improve your TypeScript skills',
      'React Server Components explained',
      'How Reddit handles millions of users',
      'Understanding the event loop once and for all',
      'CSS tricks every developer should know',
      'Why Bun is beating Node in benchmarks',
      'How to design a clean database schema',
      'Top mistakes junior devs make',
      'Is Express still relevant?',
      'Why NestJS is gaining popularity',
      'Building a caching layer with Redis',
      'Debouncing vs throttling explained',
      'How to write maintainable API code',
      'Understanding indexes in PostgreSQL',
      'React vs Vue in 2025 — deep comparison',
    ];

    const subredditIds = [1, 2, 3, 4, 5];
    const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    for (let i = 0; i < 100; i++) {
      const title = postTitles[Math.floor(Math.random() * postTitles.length)];
      const content = `This is a detailed explanation about: ${title}.  
Here we break down concepts, provide examples, and discuss best practices.  
Generated for search testing.`;

      const flairOptions = ['Discussion', 'Help', 'Guide', 'Release', null];
      const flair =
        flairOptions[Math.floor(Math.random() * flairOptions.length)];

      await queryRunner.query(
        `
        INSERT INTO posts (title, content, post_type, flair, upvotes, downvotes, subredditSubredditId, authorUserId)
        VALUES ($1, $2, 'text', $3, $4, $5, $6, $7)
        `,
        [
          title,
          content,
          flair,
          Math.floor(Math.random() * 500),
          Math.floor(Math.random() * 50),
          subredditIds[Math.floor(Math.random() * subredditIds.length)],
          userIds[Math.floor(Math.random() * userIds.length)],
        ],
      );
    }

    //
    // 4. COMMENTS (50 realistic comments)
    //
    const commentTexts = [
      'This actually makes a lot of sense. Thanks!',
      'I completely disagree — here’s why...',
      'Great explanation!',
      'Can someone explain this further?',
      'I tried this and it worked perfectly.',
      'This is outdated info.',
      'I learned something new today.',
      'Amazing breakdown, appreciate it.',
      'This should be the top comment.',
      'I was confused at first but now I get it.',
    ];

    for (let i = 0; i < 50; i++) {
      const postId = Math.floor(Math.random() * 100) + 1;
      const text =
        commentTexts[Math.floor(Math.random() * commentTexts.length)];

      const parent =
        Math.random() > 0.7 ? Math.floor(Math.random() * (i || 1)) + 1 : null;

      await queryRunner.query(
        `
        INSERT INTO comments (text, upvotes, downvotes, postPostId, parentCommentCommentId, authorUserId)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          text,
          Math.floor(Math.random() * 100),
          Math.floor(Math.random() * 20),
          postId,
          parent,
          userIds[Math.floor(Math.random() * userIds.length)],
        ],
      );
    }

    console.log('🌱 Seed data inserted successfully.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM comments`);
    await queryRunner.query(`DELETE FROM posts`);
    await queryRunner.query(`DELETE FROM subreddits`);
    await queryRunner.query(`DELETE FROM users`);
  }
}
