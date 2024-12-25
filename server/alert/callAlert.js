require('dotenv').config();
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function makeCall() {
  try {
    const call = await twilio.calls.create({
      twiml: `
        <Response>
          <Say language="vi-VN" voice="alice">Cảnh báo, đang có cháy. 
                Bạn cần di chuyển ngay khỏi đấy và gọi cứu hoả đến.</Say>
        </Response>
      `,
      from: '+12184754446',
      to: process.env.PHONE_NUMBER,
    });
    console.log('Call initiated:', call.sid);
  } catch (error) {
    console.error('Error making call:', error);
  }
}

module.exports = { makeCall };