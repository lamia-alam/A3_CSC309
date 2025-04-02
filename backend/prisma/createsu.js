const { PrismaClient } = require('@prisma/client');
const { hashedPassword } = require('../utils/jwt');

'use strict';

const prisma = new PrismaClient();

const [utorid, email, password] = process.argv.slice(2);

if (!utorid || !email || !password) {
    console.error('Please provide utorid, email, and password.');
    process.exit(1);
}

async function createSuperUser() {
    const hashedPasswordValue = await hashedPassword(password);

    try {
        const user = await prisma.user.create({
            data: {
               email,
                utorid,
                password: hashedPasswordValue,
                role: 'superuser',
                verified: true,
            },
        });
        console.log('Superuser created:', user);
    } catch (error) {
        console.error('Error creating superuser:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSuperUser();