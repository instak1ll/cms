const API_URL = 'http://localhost:5000/api';

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    // Botones de navegación
    document.getElementById('loginNavBtn').addEventListener('click', () => showPage('loginPage'));
    document.getElementById('registerNavBtn').addEventListener('click', () => showPage('registerPage'));

    // Formulario de login
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                if (data.verified) {
                    localStorage.setItem('token', data.token);
                    getUserInfo();
                } else {
                    localStorage.setItem('tempUserId', data.userId);
                    showPage('verificationPage');
                }
            } else {
                alert(data.msg);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Formulario de registro
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('tempUserId', data.userId);
                showPage('verificationPage');
            } else {
                alert(data.msg);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Formulario de verificación
    document.getElementById('verificationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('tempUserId');
        const code = document.getElementById('verificationCode').value;
        try {
            const response = await fetch(`${API_URL}/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.removeItem('tempUserId');
                getUserInfo();
            } else {
                alert(data.msg);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Botón de logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Verificar si el usuario ya está logueado
    getUserInfo();
});

async function getUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) {
        showPage('homePage');
        return;
    }
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            headers: { 'x-auth-token': token }
        });
        const user = await response.json();
        if (response.ok) {
            document.getElementById('user-name').textContent = user.name;
            showPage('welcomePage');
        } else {
            logout();
        }
    } catch (error) {
        console.error('Error:', error);
        logout();
    }
}

function logout() {
    localStorage.removeItem('token');
    showPage('homePage');
}