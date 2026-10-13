import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("reports", (table) => {
    table
      .uuid("user_id")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT");

    table.index(["user_id"], "idx_reports_user_id");
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("reports", (table) => {
    table.dropIndex(["user_id"], "idx_reports_user_id");
    table.dropForeign(["user_id"]);
    table.dropColumn("user_id");
  });
}

