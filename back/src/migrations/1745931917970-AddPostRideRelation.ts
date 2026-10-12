// src/migrations/AddPostRideRelation.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostRideRelation1648464201257 implements MigrationInterface {
  name = 'AddPostRideRelation1648464201257';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key constraint to ride table if not present
    await queryRunner.query(
      `ALTER TABLE \`ride\` ADD CONSTRAINT \`FK_ride_post\` FOREIGN KEY (\`postId\`) REFERENCES \`post\`(\`id\`) ON DELETE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the foreign key constraint
    await queryRunner.query(
      `ALTER TABLE \`ride\` DROP FOREIGN KEY \`FK_ride_post\``
    );
  }
}
