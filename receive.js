// Receive page JavaScript

const codeInput = document.getElementById('codeInput');
const receiveBtn = document.getElementById('receiveBtn');
const result = document.getElementById('result');
const error = document.getElementById('error');
const receivedText = document.getElementById('receivedText');
const copyTextBtn = document.getElementById('copyTextBtn');
const receiveAnotherBtn = document.getElementById('receiveAnotherBtn');
const metaInfo = document.getElementById('metaInfo');

// Auto-focus code input on load
window.addEventListener('load', () => {
    // Check if code is in URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        codeInput.value = code;
        receiveBtn.click();
    } else {
        codeInput.focus();
    }
});

// Receive text
receiveBtn.addEventListener('click', async () => {
    const code = codeInput.value.trim().toUpperCase();
    
    if (!code) {
        showError('Please enter a code');
        return;
    }
    
    if (code.length !== 6) {
        showError('Code must be 6 characters long');
        return;
    }
    
    receiveBtn.disabled = true;
    receiveBtn.textContent = 'Receiving...';
    hideError();
    
    try {
        const response = await fetch(`/api/receive/${code}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to receive text');
        }
        
        // Show received text
        receivedText.value = data.text;
        
        // Show metadata
        const createdAt = new Date(data.created_at);
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        const timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000 / 60));
        
        metaInfo.textContent = `Created: ${createdAt.toLocaleString()} | Expires in: ${timeLeft} minutes`;
        
        result.classList.remove('hidden');
        
        // Scroll to result
        result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (err) {
        showError(err.message || 'An error occurred while receiving text');
        result.classList.add('hidden');
    } finally {
        receiveBtn.disabled = false;
        receiveBtn.textContent = 'Receive';
    }
});

// Copy text to clipboard
copyTextBtn.addEventListener('click', () => {
    receivedText.select();
    navigator.clipboard.writeText(receivedText.value).then(() => {
        showCopyFeedback(copyTextBtn);
    });
});

// Receive another
receiveAnotherBtn.addEventListener('click', () => {
    codeInput.value = '';
    result.classList.add('hidden');
    codeInput.focus();
});

// Auto-submit on Enter key
codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        receiveBtn.click();
    }
});

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
}

function hideError() {
    error.classList.add('hidden');
}

function showCopyFeedback(button) {
    const original = button.textContent;
    button.textContent = '✓ Copied!';
    button.style.color = '#4caf50';
    setTimeout(() => {
        button.textContent = original;
        button.style.color = '';
    }, 2000);
}

