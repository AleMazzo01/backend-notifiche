import express from 'express';
import bodyParser  from 'body-parser';
import fetch from 'node-fetch';
import cron from 'node-cron';

const app = (await express)();
const PORT = 3000;

//middleware
app.use(bodyParser.json());


let tokens = [];

//endpoint per registrare i token
app.post('/register-token', (req, res) => {
    const { token } = req.body;
    if (!token || !/^ExponentPushToken\[\w+\]$/.test(token)) {
        return res.status(400).send('Token non valido!');
    }
    if (!tokens.includes(token)) {
        tokens.push(token); // Evita duplicati
        console.log('Token registrato:', token);
        res.send('Token registrato con successo!');
    } else {
        res.send('Token già registrato!');
    }
});

//unzione per inviare notifiche push
const sendPushNotification = async (token, notificationData) => {
    const message = {
        to: token,
        sound: 'default',
        title: notificationData.title || 'Titolo predefinito',
        body: notificationData.body || 'Corpo predefinito',
        data: notificationData.data || {},
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const data = await response.json();
        console.log('Risultato invio notifica:', data);

        // Rimuovi token non validi
        if (data.errors) {
            console.error(`Errore con il token ${token}:`, data.errors);
            tokens = tokens.filter(t => t !== token);
        }
    } catch (error) {
        console.error(`Errore di rete durante l'invio della notifica al token ${token}:`, error);
    }
};

cron.schedule('*/1 * * * *', () => {
    console.log('Invio notifiche cicliche...');
    tokens.forEach((token) => {
        console.log(`Invio notifica al token: ${token}`);
        sendPushNotification(token, {
            title: 'Heyyy è ora di muoversi!!!',
            body: 'Fai attività leggera',
            data: {
                screen: 'Exercise',
                info: 'Dati opzionali',
            },
        });
    });
});

//avvia il server
app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});
