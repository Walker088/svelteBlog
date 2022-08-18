import sqlite from 'better-sqlite3';

//const db = new sqlite('./svelte_blog.db')
let dbConf = {}
if (import.meta.env.VITE_DB_VERBOSE === "console") dbConf.verbose = console.log;
const db = new sqlite(`./${import.meta.env.VITE_DB_NAME}`, dbConf);

export default db
