import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(
    "report_approval_histories",
    (table) => {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("gen_random_uuid()"));

      table
        .uuid("report_id")
        .notNullable()
        .references("id")
        .inTable("reports")
        .onDelete("RESTRICT");

      table
        .uuid("approver_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("RESTRICT");

      table.string("action", 20).notNullable();
      table.text("notes").nullable();

      table
        .timestamp("created_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.check(
        "action IN ('approved', 'rejected')",
        [],
        "report_approval_histories_action_check"
      );

      table.index(
        ["report_id", "created_at"],
        "idx_approval_histories_report_date"
      );

      table.index(
        ["approver_id"],
        "idx_approval_histories_approver"
      );
    }
  );
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(
    "report_approval_histories"
  );
}

