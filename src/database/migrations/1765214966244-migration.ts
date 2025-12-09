import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765214966244 implements MigrationInterface {
  name = 'Migration1765214966244';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subreddits" ("subreddit_id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "display_name" character varying(100) NOT NULL, "description" text, "subscriber_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b2d6f955e7231107211dd8e5a76" UNIQUE ("name"), CONSTRAINT "PK_fb12d14d1ee333f14bf95e9a8a1" PRIMARY KEY ("subreddit_id"))`,
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'reddit',
        'public',
        'comments',
        'GENERATED_COLUMN',
        'score',
        'upvotes - downvotes',
      ],
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'reddit',
        'public',
        'comments',
        'GENERATED_COLUMN',
        'search_vector',
        "to_tsvector('english', coalesce(text, ''))",
      ],
    );
    await queryRunner.query(
      `CREATE TABLE "comments" ("comment_id" SERIAL NOT NULL, "text" text NOT NULL, "upvotes" integer NOT NULL DEFAULT '0', "downvotes" integer NOT NULL DEFAULT '0', "score" integer GENERATED ALWAYS AS (upvotes - downvotes) STORED NOT NULL, "depth" integer NOT NULL DEFAULT '0', "is_edited" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "search_vector" tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(text, ''))) STORED NOT NULL, "postPostId" integer, "parentCommentCommentId" integer, "authorUserId" integer, CONSTRAINT "PK_eb0d76f2ca45d66a7de04c7c72b" PRIMARY KEY ("comment_id"))`,
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'reddit',
        'public',
        'posts',
        'GENERATED_COLUMN',
        'score',
        'upvotes - downvotes',
      ],
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'reddit',
        'public',
        'posts',
        'GENERATED_COLUMN',
        'search_vector',
        "\n      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||\n      setweight(to_tsvector('english', coalesce(content, '')), 'B') ||\n      setweight(to_tsvector('english', coalesce(flair, '')), 'C')\n    ",
      ],
    );
    await queryRunner.query(`CREATE TABLE "posts" ("post_id" SERIAL NOT NULL, "title" character varying(300) NOT NULL, "content" text, "url" text, "post_type" character varying(20) NOT NULL DEFAULT 'text', "flair" character varying(100), "is_nsfw" boolean NOT NULL DEFAULT false, "is_spoiler" boolean NOT NULL DEFAULT false, "upvotes" integer NOT NULL DEFAULT '0', "downvotes" integer NOT NULL DEFAULT '0', "score" integer GENERATED ALWAYS AS (upvotes - downvotes) STORED NOT NULL, "comment_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "search_vector" tsvector GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(flair, '')), 'C')
    ) STORED NOT NULL, "subredditSubredditId" integer, "authorUserId" integer, CONSTRAINT "PK_e55cc433639d0e21c3dbf637bce" PRIMARY KEY ("post_id"))`);
    await queryRunner.query(
      `CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "username" character varying(50) NOT NULL, "email" character varying(255) NOT NULL, "karma" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_0ddfafc6ae13de3ae3e24b36dd4" FOREIGN KEY ("postPostId") REFERENCES "posts"("post_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_68d075d1b7f130d80906984ae3d" FOREIGN KEY ("parentCommentCommentId") REFERENCES "comments"("comment_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_c5da56fa978fa80ab371e666f1e" FOREIGN KEY ("authorUserId") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_c434fe8859cbc47135ae33cb10a" FOREIGN KEY ("subredditSubredditId") REFERENCES "subreddits"("subreddit_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_7054652f120f33ae1c8579cce3c" FOREIGN KEY ("authorUserId") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_7054652f120f33ae1c8579cce3c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_c434fe8859cbc47135ae33cb10a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_c5da56fa978fa80ab371e666f1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_68d075d1b7f130d80906984ae3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_0ddfafc6ae13de3ae3e24b36dd4"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`,
      ['GENERATED_COLUMN', 'search_vector', 'reddit', 'public', 'posts'],
    );
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`,
      ['GENERATED_COLUMN', 'score', 'reddit', 'public', 'posts'],
    );
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`,
      ['GENERATED_COLUMN', 'search_vector', 'reddit', 'public', 'comments'],
    );
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`,
      ['GENERATED_COLUMN', 'score', 'reddit', 'public', 'comments'],
    );
    await queryRunner.query(`DROP TABLE "subreddits"`);
  }
}
