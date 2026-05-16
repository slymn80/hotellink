import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'HotelLink <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// ---------------------------------------------------------------------------
// Shared HTML helpers
// ---------------------------------------------------------------------------

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HotelLink</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Hotel<span style="color:#93c5fd;">Link</span></h1>
              <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px;">Hospitality Talent Marketplace</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                &copy; ${new Date().getFullYear()} HotelLink. All rights reserved.<br/>
                <a href="${APP_URL}" style="color:#2563eb;text-decoration:none;">hotellink.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function btn(text: string, url: string) {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="background:#2563eb;border-radius:8px;">
        <a href="${url}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">${text}</a>
      </td>
    </tr>
  </table>`
}

function greeting(name: string | null) {
  return `<p style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Hello${name ? `, ${name}` : ''}!</p>`
}

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">${text}</p>`
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />`
}

function infoBox(label: string, value: string) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:16px 0;">
    <tr>
      <td style="padding:16px 20px;">
        <p style="margin:0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">${label}</p>
        <p style="margin:4px 0 0;color:#1e293b;font-size:15px;font-weight:600;">${value}</p>
      </td>
    </tr>
  </table>`
}

function smallNote(text: string) {
  return `<p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.5;">${text}</p>`
}

// ---------------------------------------------------------------------------
// 0. Email Verification
// ---------------------------------------------------------------------------

export async function sendVerificationEmail(params: {
  email: string
  name: string | null
  token: string
}) {
  const { email, name, token } = params
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`

  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph('Thank you for registering on HotelLink. Please verify your email address to activate your account.')}
    ${btn('Verify Email Address', verifyUrl)}
    ${divider()}
    ${smallNote('This link expires in 24 hours. If you did not create an account, you can safely ignore this email.')}
  `)

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your HotelLink account',
    html,
  })
}

// ---------------------------------------------------------------------------
// 1. Welcome / Registration Email
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail(params: {
  email: string
  name: string | null
  role: string
}) {
  const roleLabel: Record<string, string> = {
    CANDIDATE: 'Job Seeker',
    HOTEL_EMPLOYER: 'Hotel Employer',
    HR_AGENCY: 'HR Agency',
  }

  const roleNext: Record<string, string> = {
    CANDIDATE: 'Complete your profile to get discovered by top hotels.',
    HOTEL_EMPLOYER: 'Create your hotel profile and start posting jobs.',
    HR_AGENCY: 'Set up your agency profile and start connecting talent.',
  }

  const roleProfilePath: Record<string, string> = {
    CANDIDATE: '/en/candidate/profile',
    HOTEL_EMPLOYER: '/en/hotel/profile',
    HR_AGENCY: '/en/agency',
    ADMIN: '/en/admin',
  }

  const profilePath = roleProfilePath[params.role] || '/en/candidate/profile'
  const loginWithRedirect = `${APP_URL}/en/login?callbackUrl=${encodeURIComponent(profilePath)}`

  const html = baseTemplate(`
    ${greeting(params.name)}
    ${paragraph('Welcome to HotelLink — the hospitality industry\'s leading talent marketplace. Your account has been created successfully.')}
    ${infoBox('Account Type', roleLabel[params.role] || params.role)}
    ${paragraph(roleNext[params.role] || 'Your account is ready to use.')}
    ${btn('Complete My Profile', loginWithRedirect)}
    ${divider()}
    ${smallNote('If you did not create this account, please ignore this email or contact support.')}
  `)

  return resend.emails.send({
    from: FROM,
    to: params.email,
    subject: 'Welcome to HotelLink!',
    html,
  }).catch((err) => console.error('[email] sendWelcomeEmail error:', err))
}

// ---------------------------------------------------------------------------
// 2. Password Reset Email
// ---------------------------------------------------------------------------

export async function sendPasswordResetEmail(params: {
  email: string
  name: string | null
  resetUrl: string
}) {
  const html = baseTemplate(`
    ${greeting(params.name)}
    ${paragraph('We received a request to reset your HotelLink password. Click the button below to create a new password.')}
    ${btn('Reset My Password', params.resetUrl)}
    ${divider()}
    ${paragraph('This link is valid for <strong>1 hour</strong>. After that, you\'ll need to request a new reset link.')}
    ${smallNote('If you didn\'t request a password reset, you can safely ignore this email. Your password will not be changed.')}
  `)

  return resend.emails.send({
    from: FROM,
    to: params.email,
    subject: 'Reset your HotelLink password',
    html,
  }).catch((err) => console.error('[email] sendPasswordResetEmail error:', err))
}

// ---------------------------------------------------------------------------
// 3. Application Status Changed Email
// ---------------------------------------------------------------------------

const STATUS_COPY: Record<string, { subject: string; heading: string; body: string; emoji: string }> = {
  SHORTLISTED: {
    subject: 'You\'ve been shortlisted!',
    heading: 'Great news — you\'re shortlisted!',
    body: 'The hiring team has reviewed your application and shortlisted you as a strong candidate. Stay tuned for further updates.',
    emoji: '⭐',
  },
  INTERVIEW_SCHEDULED: {
    subject: 'Interview scheduled for your application',
    heading: 'Your interview has been scheduled',
    body: 'Congratulations! The hotel has scheduled an interview with you. Check your dashboard for details and prepare accordingly.',
    emoji: '📅',
  },
  OFFER_EXTENDED: {
    subject: 'You have a job offer!',
    heading: 'A job offer has been extended to you',
    body: 'Exciting news — the hotel has extended you a job offer! Log in to your dashboard to review and respond to the offer.',
    emoji: '🎉',
  },
  OFFER_ACCEPTED: {
    subject: 'Offer accepted — congratulations!',
    heading: 'Congratulations on your new role!',
    body: 'Your acceptance has been confirmed. The hotel team will be in touch with onboarding details.',
    emoji: '🏨',
  },
  REJECTED: {
    subject: 'An update on your application',
    heading: 'Application status update',
    body: 'Thank you for your interest. Unfortunately, the hotel has decided to move forward with other candidates at this time. Don\'t be discouraged — keep applying and we\'ll help you find the right role.',
    emoji: '📋',
  },
  REVIEWING: {
    subject: 'Your application is being reviewed',
    heading: 'Application under review',
    body: 'Good news — your application is currently being reviewed by the hiring team. We\'ll notify you as soon as there\'s an update.',
    emoji: '🔍',
  },
}

export async function sendApplicationStatusEmail(params: {
  email: string
  candidateName: string | null
  jobTitle: string
  hotelName: string
  newStatus: string
  dashboardUrl?: string
}) {
  const copy = STATUS_COPY[params.newStatus]
  if (!copy) return

  const url = params.dashboardUrl || `${APP_URL}/en/candidate/applications`

  const html = baseTemplate(`
    <p style="font-size:40px;margin:0 0 16px;">${copy.emoji}</p>
    ${greeting(params.candidateName)}
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;font-weight:700;">${copy.heading}</h2>
    ${infoBox('Position', params.jobTitle)}
    ${infoBox('Hotel', params.hotelName)}
    ${paragraph(copy.body)}
    ${btn('View Application', url)}
    ${smallNote('You are receiving this email because you applied for a job on HotelLink.')}
  `)

  return resend.emails.send({
    from: FROM,
    to: params.email,
    subject: `${copy.emoji} ${copy.subject} — ${params.jobTitle} at ${params.hotelName}`,
    html,
  }).catch((err) => console.error('[email] sendApplicationStatusEmail error:', err))
}

// ---------------------------------------------------------------------------
// 4. New Message Notification Email
// ---------------------------------------------------------------------------

export async function sendMessageNotificationEmail(params: {
  recipientEmail: string
  recipientName: string | null
  senderName: string
  preview: string
}) {
  const url = `${APP_URL}/en/dashboard/messages`

  const html = baseTemplate(`
    ${greeting(params.recipientName)}
    ${paragraph(`You have a new message from <strong>${params.senderName}</strong> on HotelLink.`)}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;margin:16px 0;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;color:#64748b;font-size:13px;">${params.senderName}</p>
          <p style="margin:8px 0 0;color:#1e293b;font-size:15px;font-style:italic;">"${params.preview.substring(0, 160)}${params.preview.length > 160 ? '...' : ''}"</p>
        </td>
      </tr>
    </table>
    ${btn('Reply to Message', url)}
    ${smallNote('You are receiving this email because you have message notifications enabled on HotelLink.')}
  `)

  return resend.emails.send({
    from: FROM,
    to: params.recipientEmail,
    subject: `💬 New message from ${params.senderName}`,
    html,
  }).catch((err) => console.error('[email] sendMessageNotificationEmail error:', err))
}

// ---------------------------------------------------------------------------
// 5. Hotel Verified Email
// ---------------------------------------------------------------------------

export async function sendHotelVerifiedEmail(params: {
  email: string
  ownerName: string | null
  hotelName: string
}) {
  const url = `${APP_URL}/en/hotel`

  const html = baseTemplate(`
    <p style="font-size:40px;margin:0 0 16px;">✅</p>
    ${greeting(params.ownerName)}
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;font-weight:700;">Your hotel has been verified!</h2>
    ${infoBox('Hotel', params.hotelName)}
    ${paragraph('Congratulations! Your hotel profile has been reviewed and approved by the HotelLink team. You can now post jobs and start receiving applications from qualified candidates.')}
    ${paragraph('<strong>What\'s next?</strong><br/>Post your first job listing and reach thousands of hospitality professionals actively looking for opportunities.')}
    ${btn('Post a Job', `${APP_URL}/en/hotel/jobs/new`)}
    ${divider()}
    ${smallNote('Thank you for joining HotelLink. If you have any questions, contact our support team.')}
  `)

  return resend.emails.send({
    from: FROM,
    to: params.email,
    subject: `✅ ${params.hotelName} has been verified on HotelLink`,
    html,
  }).catch((err) => console.error('[email] sendHotelVerifiedEmail error:', err))
}

// ---------------------------------------------------------------------------
// 6. Hotel Rejected Email
// ---------------------------------------------------------------------------

export async function sendHotelRejectedEmail(params: {
  email: string
  ownerName: string | null
  hotelName: string
  reason: string
}) {
  const html = baseTemplate(`
    ${greeting(params.ownerName)}
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;font-weight:700;">Verification update for ${params.hotelName}</h2>
    ${paragraph('Thank you for submitting your hotel for verification. After review, our team was unable to approve your profile at this time.')}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin:16px 0;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;color:#991b1b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Reason</p>
          <p style="margin:8px 0 0;color:#7f1d1d;font-size:15px;">${params.reason}</p>
        </td>
      </tr>
    </table>
    ${paragraph('You are welcome to update your hotel profile and resubmit for verification. Our team will review it again.')}
    ${btn('Update Hotel Profile', `${APP_URL}/en/hotel/settings`)}
    ${smallNote('If you believe this decision was made in error, please contact our support team.')}
  `)

  return resend.emails.send({
    from: FROM,
    to: params.email,
    subject: `Action required: Verification update for ${params.hotelName}`,
    html,
  }).catch((err) => console.error('[email] sendHotelRejectedEmail error:', err))
}

// ---------------------------------------------------------------------------
// 7. Payment Confirmation Email
// ---------------------------------------------------------------------------

export async function sendPaymentConfirmationEmail(params: {
  email: string
  name: string | null
  planName: string
  amount: number
  currency: string
  invoiceDate: Date
}) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: params.currency.toUpperCase(),
  }).format(params.amount / 100)

  const html = baseTemplate(`
    <p style="font-size:40px;margin:0 0 16px;">🧾</p>
    ${greeting(params.name)}
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;font-weight:700;">Payment confirmed</h2>
    ${paragraph('Thank you for your payment. Your subscription has been activated.')}
    ${infoBox('Plan', params.planName)}
    ${infoBox('Amount', formatted)}
    ${infoBox('Date', params.invoiceDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}
    ${btn('View Dashboard', `${APP_URL}/en/hotel`)}
    ${smallNote('This is your payment confirmation. Keep it for your records.')}
  `)

  return resend.emails.send({
    from: FROM,
    to: params.email,
    subject: `Payment confirmed — ${params.planName} subscription`,
    html,
  }).catch((err) => console.error('[email] sendPaymentConfirmationEmail error:', err))
}

// ---------------------------------------------------------------------------
// 8. Payment Failed Email
// ---------------------------------------------------------------------------

export async function sendPaymentFailedEmail(params: {
  email: string
  name: string | null
  planName: string
}) {
  const html = baseTemplate(`
    <p style="font-size:40px;margin:0 0 16px;">⚠️</p>
    ${greeting(params.name)}
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;font-weight:700;">Payment failed</h2>
    ${paragraph(`We were unable to process the payment for your <strong>${params.planName}</strong> subscription. Please update your payment details to continue using HotelLink.`)}
    ${paragraph('Your account remains active for a short grace period, but job posting will be restricted if payment is not resolved.')}
    ${btn('Update Payment Details', `${APP_URL}/en/hotel/billing`)}
    ${divider()}
    ${smallNote('If you need help, contact our support team and we\'ll assist you.')}
  `)

  return resend.emails.send({
    from: FROM,
    to: params.email,
    subject: '⚠️ Payment failed — action required',
    html,
  }).catch((err) => console.error('[email] sendPaymentFailedEmail error:', err))
}
