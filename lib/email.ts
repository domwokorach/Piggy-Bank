import { Resend } from 'resend'

const resend = new Resend(process.env.EMAIL_PROVIDER_API_KEY)

async function send(to: string, subject: string, html: string): Promise<void> {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }
}

export async function sendVerificationPinEmail(to: string, firstName: string, pin: string): Promise<void> {
  await send(
    to,
    'Your Piggy Bank verification PIN',
    `
      <p>Hi ${firstName},</p>
      <p>Your Piggy Bank verification PIN is:</p>
      <p style="font-size: 28px; font-weight: 600; letter-spacing: 0.3em;">${pin}</p>
      <p>This PIN expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  )
}

export async function sendAccountDeletionPinEmail(to: string, firstName: string, pin: string): Promise<void> {
  await send(
    to,
    'Confirm closing your Piggy Bank account',
    `
      <p>Hi ${firstName},</p>
      <p>We received a request to close your Piggy Bank account. Enter this code to confirm:</p>
      <p style="font-size: 28px; font-weight: 600; letter-spacing: 0.3em;">${pin}</p>
      <p>This code expires in 10 minutes. If you didn't request this, please log in and cancel the closure request immediately, or contact support.</p>
    `,
  )
}

export async function sendAccountClosedEmail(to: string, firstName: string): Promise<void> {
  await send(
    to,
    'Your Piggy Bank account has been closed',
    `
      <p>Hi ${firstName},</p>
      <p>Your Piggy Bank account has been closed as requested. You no longer have access to your Parent Account, linked Kids Accounts, cards, or transaction history through Piggy Bank.</p>
      <p>If you didn't request this, please contact support immediately.</p>
    `,
  )
}
