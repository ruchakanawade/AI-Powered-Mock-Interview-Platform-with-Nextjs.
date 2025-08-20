/** @type {import("drizzle-kit").Config} */

export default {
  schema: "./utils/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_AcPBHZpQ0jE4@ep-bold-shape-a10qj3h9-pooler.ap-southeast-1.aws.neon.tech/ai-interview-mocker?sslmode=require&channel_binding=require"
  }
};
