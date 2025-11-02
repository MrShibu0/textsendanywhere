// Send page JavaScript

const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const sendBtn = document.getElementById('sendBtn');
const result = document.getElementById('result');
const error = document.getElementById('error');
const codeDisplay = document.getElementById('codeDisplay');
const linkDisplay = document.getElementById('linkDisplay');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const sendAnotherBtn = document.getElementById('sendAnotherBtn');

// Update character count
textInput.addEventListener('input', () => {
    const count = textInput.value.length;
    charCount.textContent = count;
    
    if (count > 5000) {
        charCount.style.color = '#f44336';
    } else {
        charCount.style.color = '#888';
    }
});

// Send text
sendBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    
    if (!text) {
        showError('Please enter some text to send');
        return;
    }
    
    if (text.length > 5120) {
        showError('Text exceeds maximum length of 5120 characters');
        return;
    }
    
    // Check byte size
    const byteSize = new Blob([text]).size;
    if (byteSize > 5 * 1024) {
        showError('Text exceeds maximum size of 5 KB');
        return;
    }
    
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    hideError();
    
    try {
        const response = await fetch('/api/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to send text');
        }
        
        // Show success result
        codeDisplay.textContent = data.code;
        linkDisplay.value = data.link;
        result.classList.remove('hidden');
        
        // Scroll to result
        result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (err) {
        showError(err.message || 'An error occurred while sending text');
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
    }
});

// Copy code to clipboard
copyCodeBtn.addEventListener('click', () => {
    const code = codeDisplay.textContent;
    navigator.clipboard.writeText(code).then(() => {
        showCopyFeedback(copyCodeBtn);
    });
});

// Copy link to clipboard
copyLinkBtn.addEventListener('click', () => {
    const link = linkDisplay.value;
    navigator.clipboard.writeText(link).then(() => {
        showCopyFeedback(copyLinkBtn);
    });
});

// Send another
sendAnotherBtn.addEventListener('click', () => {
    textInput.value = '';
    charCount.textContent = '0';
    result.classList.add('hidden');
    textInput.focus();
});

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
    result.classList.add('hidden');
}

function hideError() {
    error.classList.add('hidden');
}

function showCopyFeedback(button) {
    const original = button.textContent;
    button.textContent = '✓';
    button.style.color = '#4caf50';
    setTimeout(() => {
        button.textContent = original;
        button.style.color = '';
    }, 2000);
}

// Allow Enter key to send (Ctrl+Enter or Shift+Enter)
textInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.shiftKey) && e.key === 'Enter') {
        sendBtn.click();
    }
});

