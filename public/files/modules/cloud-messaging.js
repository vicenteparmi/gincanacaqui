const messaging = firebase.messaging();
const auth = firebase.auth();

// Confirm to recive push notifications

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        messaging.requestPermission().then(function () {
            console.log('Notification permission granted.');
            return messaging.getToken();
        }).then(function (token) {
            // If user exists, update
            if (user.uid) {
                firebase.database().ref('users/' + user.uid).update({
                    token: token
                });
            }
        }).catch(function (err) {
            console.log('Unable to get permission to notify.', err);
            popupMessageError();
        });
    }
});

messaging.onMessage(function (payload) {
    console.log('Message received. ', payload);

    // Create popup notification
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.icon
    };

    // Append notification to body
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; bottom: 2vh; left: 2vh; width: auto; padding: 10px; background-color: #fff; border-top: 1px solid #ccc;';
    notification.innerHTML = `
        <div style="display: flex; align-items: center;">
            <img src="${notificationOptions.icon}" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px;">
            <div>
                <h4 style="margin: 0;">${notificationTitle}</h4>
                <p style="margin: 0;">${notificationOptions.body}</p>
            </div>
        </div>
    `;
    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(function () {
        document.body.removeChild(notification);
    }, 10000);

    // Remove on click
    notification.addEventListener('click', function () {
        document.body.removeChild(notification);
    });
});

// Popup notification

function popupMessageError() {
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; bottom: 2vh; right: 2vh; max-width: 300px; padding: 16px; background-color: #fff; border-radius: 16px; box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);';
    notification.innerHTML = `
        <div style="display: flex; align-items: flex-start;">
            <div>
                <h4 style="margin: 0;">Notificações bloqueadas</h4>
                <p style="margin: 0;">Quando quiser altere as confirugações de notificações. Através delas avisamos quando uma atividade for aprovada, rejeitada e podemo enviar avisos gerais.</p>
            </div>
        </div>
    `;
    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(function () {
        document.body.removeChild(notification);
    }, 10000);

    // Remove on click
    notification.addEventListener('click', function () {
        document.body.removeChild(notification);
    });
}