import express from 'express';
import bodyParser  from 'body-parser';
import fetch from 'node-fetch';
import cron from 'node-cron';

const app = (await express)();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Variabile temporanea per salvare i token
let tokens = [];

// Endpoint per registrare i token
app.post('/register-token', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).send('Token mancante!');
    if (!tokens.includes(token)) tokens.push(token); // Evita duplicati
    console.log('Token registrato:', token);
    res.send('Token registrato con successo!');
});

// Funzione per inviare notifiche push
const sendPushNotification = async (token, message) => {
    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: token,
                sound: 'default',
                title: message.title,
                body: message.body,
                data: message.data,
            }),
        });

        const responseData = await response.json();
        console.log('Notifica inviata:', responseData);
    } catch (error) {
        console.error('Errore durante l\'invio della notifica:', error);
    }
};

cron.schedule('*/1 * * * *', () => {
// Pianifica notifiche cicliche ogni 3 ore
//cron.schedule('0 */3 * * *', () => {
    console.log('Invio notifiche cicliche...');
    tokens.forEach((token) => {
        sendPushNotification(token, {
            title: 'Promemoria!',
            body: 'Ehi, sono passate 3 ore! Controlla la tua app.',
            data: { info: 'Dati opzionali' },
        });
    });
});

// Avvia il server
app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});
