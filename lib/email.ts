import { Resend } from 'resend'

const resend = new Resend(process.env.EMAIL_PROVIDER_API_KEY)

export async function sendVerificationPinEmail(to: string, firstName: string, pin: string): Promise<void> {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'Your Piggy Bank verification PIN',
    html: `
      <p>Hi ${firstName},</p>
      <p>Your Piggy Bank verification PIN is:</p>
      <p style="font-size: 28px; font-weight: 600; letter-spacing: 0.3em;">${pin}</p>
      <p>This PIN expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  })

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`)
  }
}
