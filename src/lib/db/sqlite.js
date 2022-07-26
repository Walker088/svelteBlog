import sqlite from 'better-sqlite3';

//const db = new sqlite('./svelte_blog.db')

const db = new sqlite(`./${import.meta.env.VITE_DB_NAME}`)

export default db
