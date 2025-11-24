import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const senderId = process.env.TWILIO_SENDER_ID;

const client = twilio(accountSid, authToken);

export async function sendPhoneOTP(phone: string, code: string): Promise<void> {
  if (!accountSid || !authToken || !senderId) {
    throw new Error('Twilio credentials not configured');
  }

  await client.messages.create({
    body: `Your verification code is: ${code}. It will expire in 10 minutes.`,
    from: senderId,
    to: phone,
  });
}
