import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("reports", (table) => {
    table
      .uuid("id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table.string("name", 150).notNullable();
    table.text("description").notNullable();

    table
      .string("status", 20)
      .notNullable()
      .defaultTo("pending");

    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.check(
      "status IN ('pending', 'approved', 'rejected')",
      [],
      "reports_status_check"
    );

    table.index(["status"], "idx_reports_status");
    table.index(["created_at"], "idx_reports_created_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("reports");
}

