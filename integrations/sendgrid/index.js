const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


module.exports.welcome = (userEmail, userFirstName) => {
    const msg = {
        to: userEmail, // Change to your recipient
        from: 'jan@lekszycki.com', // Change to your verified sender
        subject: `Welcome to Glocacity, ${userFirstName}`,
        text: 'and thank you for registering',
        html: '<strong>and thank you for registering</strong>',
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log(`Welcome email sent to ${userEmail}`)
        })
        .catch((error) => {
            console.error(error)
        })
}

module.exports.verifyEmail = (userEmail, userFirstName, verificationLink) => {
    const msg = {
        to: userEmail,
        from: 'jan@lekszycki.com',
        subject: `${userFirstName}, Verify you Glocacity Profile`,
        text: `Please click following link in oder to verify your profile in Glocacity:\n\n*********************************\n${verificationLink}\n*********************************\n\nLink is valid for 24h only`,
    }
    sgMail
        .send(msg)
        .then(() => {
        })
        .catch((error) => {
            console.error(error)
        })
}
