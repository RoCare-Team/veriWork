/**
 * First-run product tour content, one track per portal.
 *
 * Shown once after a user lands in their portal (i.e. once login is complete)
 * and is always skippable — see components/common/FeatureTour.jsx.
 */

export const TOUR_VERSION = 'v1'

export const EMPLOYEE_TOUR = {
  title: 'Welcome to PagerLook',
  subtitle: 'Your verified professional identity — built once, trusted everywhere.',
  steps: [
    {
      icon: 'shield',
      title: 'Verify once, not for every job',
      body: 'Verify your identity (Aadhaar + face), employment history, education and documents a single time. No more re-submitting the same papers to every employer.',
      points: ['Aadhaar e-KYC via DigiLocker', 'Live face match', 'Employment & education checks'],
    },
    {
      icon: 'chart',
      title: 'Build your PagerLook Score',
      body: 'Every verified detail adds to one trust score — like CIBIL, but for your career. Employers use it to make faster hiring decisions.',
      points: ['Score range 300–900', 'See exactly what raises it', 'Improves as you add verified data'],
    },
    {
      icon: 'idcard',
      title: 'Professional ID & Job History',
      body: 'Get a shareable Professional ID and a verified employment record. Add past jobs and request verification from your previous employers in a click.',
      points: ['Shareable profile link', 'Verified job history', 'Secure document vault'],
    },
    {
      icon: 'lock',
      title: 'You stay in control',
      body: 'Nothing is shared without your approval. Companies must request access, you approve or deny, and every access is logged in your activity trail.',
      points: ['Consent-based sharing', 'Approve or deny any request', 'Full activity log'],
    },
  ],
}

export const ENTERPRISE_TOUR = {
  title: 'Welcome to PagerLook for Employers',
  subtitle: 'Hire with verified trust — reuse verified data instead of repeating checks.',
  steps: [
    {
      icon: 'users',
      title: 'Build your workforce',
      body: 'Invite employees by PagerLook ID, mobile or email — or share a join link. Scan-to-join QR codes make bulk and field onboarding instant.',
      points: ['Invite registered or new employees', 'Shareable invite links', 'QR onboarding'],
    },
    {
      icon: 'badge',
      title: 'Employment verification',
      body: "Request verification of a candidate's past employment. If their previous company is on PagerLook it lands on their dashboard; otherwise HR gets a secure form by email.",
      points: ['No-login HR verification form', 'Track sent / responded status', 'Verified salary & tenure'],
    },
    {
      icon: 'lock',
      title: 'Consent-based access',
      body: 'Request access to an employee\'s verified profile and documents. They approve it, and every request is recorded in your audit log.',
      points: ['Employee approves each request', 'Full audit trail', 'Compliance-ready records'],
    },
    {
      icon: 'key',
      title: 'Roles & permissions',
      body: 'Add your HR and recruiting team with their own logins. Create custom roles and control exactly which modules each person can view or manage.',
      points: ['Custom roles', 'Per-module permissions', 'Staff accounts with passwords'],
    },
  ],
}

export function getTourForPortal(portal) {
  return portal === 'enterprise' ? ENTERPRISE_TOUR : EMPLOYEE_TOUR
}
