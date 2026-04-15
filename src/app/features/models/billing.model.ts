import { PlanCode } from '../../shared/models/payment.model';

export const plans = [
  {
    code: 'Free' as PlanCode,
    badge: 'Free',
    title: 'Free',
    price: '$0',
    suffix: '/month',
    features: [
      '2 active workflows',
      '10 submissions / month',
      '25 emails / month',
      'Basic PDF export (with watermark)'
    ],
  },
  {
    code: 'Pro' as PlanCode,
    badge: 'Most popular',
    title: 'Pro',
    price: '$19',
    suffix: '/month',
    features: [
      '25 active workflows',
      '250 submissions / month',
      '500 emails / month',
      'Remove watermark',
      'Reminders included',
      'Custom logo in PDF',
      'Branded PDF export',
    ],
  },
  {
    code: 'Business' as PlanCode,
    badge: 'Best for teams',
    title: 'Business',
    price: '$49',
    suffix: '/month',
    features: [
      '100 active workflows',
      '2000 submissions / month',
      '5000 emails / month',
      'Remove watermark',
      'Reminders included',
      'Advanced PDF customization',
      'Branding (logo + colors)',
    ],
  },
];