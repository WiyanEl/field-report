import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table
      .uuid("id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table.string("name", 150).notNullable();
    table.string("email", 255).notNullable().unique();
    table.string("password_hash", 255).notNullable();

    table
      .string("role", 20)
      .notNullable()
      .defaultTo("reporter");

    table
      .boolean("is_active")
      .notNullable()
      .defaultTo(true);

    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.check(
      "role IN ('admin', 'reporter', 'approver')",
      [],
      "users_role_check"
    );

    table.index(["role"], "idx_users_role");
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
}

