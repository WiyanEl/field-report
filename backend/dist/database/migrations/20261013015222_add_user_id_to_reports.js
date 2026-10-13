"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
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
async function down(knex) {
    await knex.schema.alterTable("reports", (table) => {
        table.dropIndex(["user_id"], "idx_reports_user_id");
        table.dropForeign(["user_id"]);
        table.dropColumn("user_id");
    });
}
