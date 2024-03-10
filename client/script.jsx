import React from 'react';

function Chat() {
    const chatOutput = document.getElementById('chat-output');
    const submitButton = document.getElementById('sendButton');
    const spinnerDiv = document.getElementById('spinner');

    if (!submitButton) {
        console.error('Submit button not found.');
        return;
    }

    submitButton.disabled = true;

    let userInput = document.getElementById('user-input').value;

    if (userInput != null && userInput) {
        submitButton.innerHTML = '<span class="spinner"></span> Sending...';

        if (spinnerDiv) {
            spinnerDiv.style.display = 'block';
        }

        if (userInput.toLowerCase() === 'random') {
            fetch('https://random-word-api.herokuapp.com/word', {
                method: 'GET',
            })
                .then(response => response.json())
                .then(data => {
                    const randomWord = data[0];
                    chatOutput.innerHTML += `<div><strong>Gebruiker:</strong> ${randomWord}</div>`;

                    return fetch('http://localhost:3000/chat/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ prompt: randomWord }),
                    });
                })
                .then(response => response.json())
                .then(data => {
                    chatOutput.innerHTML += `<div><strong>Poke AI:</strong> ${data.response}</div>`;
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                })
                .finally(() => {
                    // Hide the spinner
                    if (spinnerDiv) {
                        spinnerDiv.style.display = 'none';
                    }

                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Send';

                    document.getElementById('user-input').value = '';
                });
        }else{
            chatOutput.innerHTML += `<div><strong>Gebruiker:</strong> ${userInput}</div>`;
            fetch(`http://localhost:3000/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userInput }),
            })
                .then(response => response.json())
                .then(data => {
                    chatOutput.innerHTML += `<div><strong>Poke AI:</strong> ${data.response}</div>`;
                })
                .catch(error => {
                    console.error('Error fetching answer:', error);
                })
                .finally(() => {
                    if (spinnerDiv) {
                        spinnerDiv.style.display = 'none';
                    }

                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Send';

                    document.getElementById('user-input').value = '';
                });
        }
    }

    document.getElementById('user-input').value = '';
}

export default Chat;
