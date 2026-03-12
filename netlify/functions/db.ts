import { neon, neonConfig } from '@neondatabase/serverless';
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// Use the DATABASE_URL environment variable set in Netlify
const CONN_STRING = process.env.DATABASE_URL!;
neonConfig.fetchConnectionCache = true;
const sql = neon(CONN_STRING);

const createTables = async () => {
    await sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, avatar TEXT, created_at BIGINT)`;
    await sql`CREATE TABLE IF NOT EXISTS user_configs (user_id TEXT PRIMARY KEY, config TEXT)`;
    await sql`CREATE TABLE IF NOT EXISTS vaults (user_id TEXT PRIMARY KEY, data TEXT)`;
};

// Initialize tables on cold start
createTables();

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    const path = event.path.replace('/api/db', '');
    const method = event.httpMethod;

    try {
        if (path === '/health' && method === 'GET') {
            return { statusCode: 200, body: JSON.stringify({ status: 'ok' }) };
        }
        
        if (path === '/users' && method === 'GET') {
            const users = await sql`SELECT * FROM users`;
            return { statusCode: 200, body: JSON.stringify(users) };
        }
        
        if (path === '/user' && method === 'POST') {
            const { user } = JSON.parse(event.body!);
            await sql`
                INSERT INTO users (id, name, avatar, created_at) 
                VALUES (${user.id}, ${user.name}, ${user.avatar || ''}, ${user.createdAt}) 
                ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, avatar = EXCLUDED.avatar
            `;
            return { statusCode: 200, body: JSON.stringify({ success: true }) };
        }
        
        if (path === '/config' && method === 'GET') {
            const userId = event.queryStringParameters?.userId;
            const result = await sql`SELECT config FROM user_configs WHERE user_id = ${userId}`;
            return { statusCode: 200, body: result.length > 0 ? result[0].config : JSON.stringify(null) };
        }
        
        if (path === '/config' && method === 'POST') {
            const { config } = JSON.parse(event.body!);
            await sql`
                INSERT INTO user_configs (user_id, config) 
                VALUES (${config.userId}, ${JSON.stringify(config)}) 
                ON CONFLICT (user_id) DO UPDATE SET config = EXCLUDED.config
            `;
            return { statusCode: 200, body: JSON.stringify({ success: true }) };
        }
        
        if (path === '/vault' && method === 'GET') {
            const userId = event.queryStringParameters?.userId;
            const result = await sql`SELECT data FROM vaults WHERE user_id = ${userId}`;
            return { statusCode: 200, body: JSON.stringify({ data: result.length > 0 ? result[0].data : null }) };
        }
        
        if (path === '/vault' && method === 'POST') {
            const { userId, data } = JSON.parse(event.body!);
            await sql`
                INSERT INTO vaults (user_id, data) 
                VALUES (${userId}, ${data}) 
                ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data
            `;
            return { statusCode: 200, body: JSON.stringify({ success: true }) };
        }

        return { statusCode: 404, body: JSON.stringify({ message: 'Not Found' }) };

    } catch (error: any) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};

export { handler };
