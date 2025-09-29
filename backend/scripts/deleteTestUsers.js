import db from '../config/database.js';

async function deleteTestUsers() {
    try {
        console.log('=== Eliminador de Usuarios de Testing ===\n');

        // Buscar usuarios de testing (que empiecen con 'test_')
        const testUsers = await db('users')
            .where('username', 'like', 'test_%')
            .orWhere('email', 'like', '%@testing.local')
            .select('id', 'username', 'email', 'role');

        if (testUsers.length === 0) {
            console.log('✅ No se encontraron usuarios de testing para eliminar.');
            return;
        }

        console.log(`📋 Se encontraron ${testUsers.length} usuarios de testing:`);
        testUsers.forEach(user => {
            console.log(`   - ${user.username} (${user.email}) - Rol: ${user.role}`);
        });
        console.log('');

        // Eliminar usuarios de testing
        const deletedCount = await db('users')
            .where('username', 'like', 'test_%')
            .orWhere('email', 'like', '%@testing.local')
            .del();

        console.log(`✅ Se eliminaron ${deletedCount} usuarios de testing exitosamente.`);

    } catch (error) {
        console.error('❌ Error al eliminar usuarios de testing:', error.message);
        process.exit(1);
    } finally {
        await db.destroy();
    }
}

async function deleteSpecificUser(username) {
    try {
        console.log('=== Eliminador de Usuario Específico ===\n');

        // Verificar si el usuario existe
        const user = await db('users')
            .where('username', username)
            .first();

        if (!user) {
            console.log(`❌ No se encontró el usuario: ${username}`);
            return;
        }

        // Verificar si es un usuario de testing
        if (!username.startsWith('test_') && !user.email.includes('@testing.local')) {
            console.log(`⚠️  ADVERTENCIA: El usuario "${username}" no parece ser un usuario de testing.`);
            console.log('   Este script está diseñado para eliminar solo usuarios de testing.');
            console.log('   Para eliminar otros usuarios, hazlo manualmente desde la base de datos.');
            return;
        }

        console.log(`📋 Usuario encontrado:`);
        console.log(`   - ${user.username} (${user.email}) - Rol: ${user.role}`);
        console.log('');

        // Eliminar el usuario específico
        const deletedCount = await db('users')
            .where('username', username)
            .del();

        if (deletedCount > 0) {
            console.log(`✅ Usuario "${username}" eliminado exitosamente.`);
        } else {
            console.log(`❌ No se pudo eliminar el usuario "${username}".`);
        }

    } catch (error) {
        console.error('❌ Error al eliminar usuario:', error.message);
        process.exit(1);
    } finally {
        await db.destroy();
    }
}

async function listTestUsers() {
    try {
        console.log('=== Usuarios de Testing ===\n');

        const testUsers = await db('users')
            .where('username', 'like', 'test_%')
            .orWhere('email', 'like', '%@testing.local')
            .select('id', 'username', 'email', 'display_name', 'role', 'is_active', 'created_at')
            .orderBy('created_at', 'desc');

        if (testUsers.length === 0) {
            console.log('No hay usuarios de testing en la base de datos');
            return;
        }

        testUsers.forEach(user => {
            const status = user.is_active ? '✅' : '❌';
            console.log(`${status} ${user.username} (${user.email})`);
            console.log(`   ID: ${user.id} | Rol: ${user.role} | Nombre: ${user.display_name}`);
            console.log(`   Creado: ${new Date(user.created_at).toLocaleDateString()}\n`);
        });

    } catch (error) {
        console.error('❌ Error al listar usuarios de testing:', error.message);
        process.exit(1);
    } finally {
        await db.destroy();
    }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    console.log('=== Eliminador de Usuarios de Testing ===\n');
    console.log('Uso:');
    console.log('  node deleteTestUsers.js all                         - Eliminar todos los usuarios de testing');
    console.log('  node deleteTestUsers.js <usuario>                   - Eliminar usuario específico de testing');
    console.log('  node deleteTestUsers.js list                        - Listar usuarios de testing');
    console.log('  node deleteTestUsers.js help                        - Mostrar esta ayuda');
    console.log('\nEjemplos:');
    console.log('  node deleteTestUsers.js all');
    console.log('  node deleteTestUsers.js test_admin');
    console.log('  node deleteTestUsers.js list');
    console.log('\nNOTA: Solo elimina usuarios que empiecen con "test_" o tengan email "@testing.local"');
    
    if (args.length === 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
} else if (args[0] === 'all') {
    deleteTestUsers();
} else if (args[0] === 'list') {
    listTestUsers();
} else if (args.length === 1) {
    const username = args[0];
    deleteSpecificUser(username);
} else {
    console.error('❌ Argumentos incorrectos.');
    console.error('Usa "node deleteTestUsers.js help" para ver las opciones disponibles.');
    process.exit(1);
}