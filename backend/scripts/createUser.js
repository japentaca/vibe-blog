import bcrypt from 'bcrypt';
import db from '../config/database.js';

async function createUser(username, password, email = null, role = 'admin') {
    try {
        console.log('=== Creador de Usuarios para Blog ===\n');

        // Validaciones
        if (!username || !password) {
            throw new Error('Nombre de usuario y contraseña son obligatorios');
        }

        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        // Si no se proporciona email, usar username@blog.local
        const userEmail = email || `${username}@blog.local`;

        // Verificar si el usuario ya existe
        const existingUser = await db('users')
            .where('username', username)
            .orWhere('email', userEmail)
            .first();

        if (existingUser) {
            throw new Error('Ya existe un usuario con ese nombre de usuario o email');
        }

        // Hashear la contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear el usuario
        const [userId] = await db('users').insert({
            username,
            email: userEmail,
            display_name: username,
            bio: null,
            password_hash: hashedPassword,
            role,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        });

        console.log(`✅ Usuario creado exitosamente:`);
        console.log(`   ID: ${userId}`);
        console.log(`   Usuario: ${username}`);
        console.log(`   Email: ${userEmail}`);
        console.log(`   Rol: ${role}`);
        console.log(`   Nombre para mostrar: ${username}`);

    } catch (error) {
        console.error('❌ Error al crear usuario:', error.message);
        process.exit(1);
    } finally {
        await db.destroy();
    }
}

async function listUsers() {
    try {
        const users = await db('users')
            .select('id', 'username', 'email', 'display_name', 'role', 'is_active', 'created_at')
            .orderBy('created_at', 'desc');

        if (users.length === 0) {
            console.log('No hay usuarios en la base de datos');
            return;
        }

        console.log('=== Usuarios en la base de datos ===\n');
        users.forEach(user => {
            const status = user.is_active ? '✅' : '❌';
            console.log(`${status} ${user.username} (${user.email})`);
            console.log(`   ID: ${user.id} | Rol: ${user.role} | Nombre: ${user.display_name}`);
            console.log(`   Creado: ${new Date(user.created_at).toLocaleDateString()}\n`);
        });

    } catch (error) {
        console.error('❌ Error al listar usuarios:', error.message);
        process.exit(1);
    } finally {
        await db.destroy();
    }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    console.log('=== Creador de Usuarios para Blog ===\n');
    console.log('Uso:');
    console.log('  node createUser.js <usuario> <contraseña> [email] [rol]');
    console.log('  node createUser.js list                              - Listar usuarios existentes');
    console.log('  node createUser.js help                              - Mostrar esta ayuda');
    console.log('\nEjemplos:');
    console.log('  node createUser.js admin mipassword123');
    console.log('  node createUser.js editor password456 editor@blog.com editor');
    console.log('  node createUser.js autor password789 autor@blog.com author');
    console.log('\nRoles disponibles: admin, editor, author (por defecto: admin)');
    
    if (args.length === 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
} else if (args[0] === 'list') {
    listUsers();
} else if (args.length >= 2) {
    const [username, password, email, role] = args;
    createUser(username, password, email, role);
} else {
    console.error('❌ Argumentos insuficientes. Se requieren al menos usuario y contraseña.');
    console.error('Usa "node createUser.js help" para ver las opciones disponibles.');
    process.exit(1);
}