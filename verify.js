document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loading-container').style.display = 'none';
    document.querySelector('.container').style.display = 'block';

    // Check if HWID is provided in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const hwid = urlParams.get('hwid');

    if (hwid) {
        validateUser(hwid);
    }
});

async function validateUser(hwid) {
    try {
        // Fetch HWID verification from the Flask backend
        const response = await fetch(`https://your-flask-backend-url/verify2?hwid=${hwid}`);
        const data = await response.text();
        if (response.ok && data.includes("HWID verified successfully")) {
            document.getElementById('error-message').classList.add('hidden');
            document.getElementById('continue-btn').classList.add('hidden');
            document.getElementById('get-key-btn').classList.remove('hidden');
        } else {
            document.getElementById('error-message').innerText = data;
            document.getElementById('error-message').classList.remove('hidden');
            document.getElementById('get-key-btn').classList.add('hidden');
        }
    } catch (error) {
        console.error('Validation error:', error);
    }
}

async function fetchKey() {
    const userId = document.getElementById('user-id').value;
    try {
        // Fetch key generation from the Flask backend
        const response = await fetch('/generate_key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId })
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('key-display').innerText = data.key;
            const expirationTime = new Date(data.expiration).getTime();
            document.getElementById('key-display').classList.remove('hidden');
            document.getElementById('timer-bar-inner').classList.remove('hidden');
            document.getElementById('timer-message').classList.remove('hidden');
            startTimer(expirationTime);
        } else {
            document.getElementById('key-display').classList.add('hidden');
            document.getElementById('timer-bar-inner').classList.add('hidden');
            document.getElementById('timer-message').classList.add('hidden');
            console.error('Error fetching key:', data.message);
        }
    } catch (error) {
        console.error('Key generation error:', error);
    }
}

function startTimer(expirationTime) {
    const timerBarInner = document.getElementById('timer-bar-inner');
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = expirationTime - now;

        if (distance < 0) {
            clearInterval(interval);
            timerBarInner.style.width = '0%';
            document.getElementById('timer-message').innerText = 'Your key has expired!';
        } else {
            const percentage = ((expirationTime - now) / (24 * 60 * 60 * 1000)) * 100;
            timerBarInner.style.width = percentage + '%';
        }
    }, 1000);
}
