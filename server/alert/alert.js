import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function makeCall() {
  try {
    const call = await client.calls.create({
      twiml: `
        <Response>
          <Say language="vi-VN" voice="alice">
            Cảnh báo, đang có cháy. Bạn cần di chuyển ngay khỏi đấy và gọi cứu hoả đến.
          </Say>
        </Response>
      `,
      from: "+12184754446",
      to: process.env.PHONE_NUMBER,
    });
    console.log("Call initiated:", call.sid);
  } catch (error) {
    console.error("Error making call:", error);
  }
}
