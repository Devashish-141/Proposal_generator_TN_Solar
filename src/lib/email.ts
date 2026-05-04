import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendApprovalEmail({
  clientName,
  clientEmail,
  systemSizeKw,
  proposalId,
  token,
}: {
  clientName: string
  clientEmail: string
  systemSizeKw: number
  proposalId: string
  token: string
}) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  await transporter.sendMail({
    from: `"TN Solar Engine" <${process.env.GMAIL_USER}>`,
    to: adminEmail,
    subject: `✅ Proposal Approved — ${clientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #059669; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Proposal Approved!</h1>
        </div>

        <p style="font-size: 16px; color: #334155;">
          Great news! <strong>${clientName}</strong> has approved their solar proposal.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background: #f8fafc; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 12px 16px; font-weight: bold; color: #64748b; font-size: 13px;">CLIENT</td>
            <td style="padding: 12px 16px; color: #1e293b; font-size: 14px;">${clientName}</td>
          </tr>
          <tr style="background: white;">
            <td style="padding: 12px 16px; font-weight: bold; color: #64748b; font-size: 13px;">EMAIL</td>
            <td style="padding: 12px 16px; color: #1e293b; font-size: 14px;">${clientEmail}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: bold; color: #64748b; font-size: 13px;">SYSTEM SIZE</td>
            <td style="padding: 12px 16px; color: #1e293b; font-size: 14px;">${systemSizeKw} kW</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 32px;">
          <a href="${appUrl}/proposals/${proposalId}"
            style="display: inline-block; padding: 14px 32px; background: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
            View in Dashboard
          </a>
        </div>

        <p style="margin-top: 32px; font-size: 12px; color: #94a3b8; text-align: center;">
          Client proposal link: ${appUrl}/p/${token}
        </p>
      </div>
    `,
  })
}
