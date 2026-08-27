import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  standalone: false,
})
export class LandingPageComponent implements OnInit {
  activeStep = 0;

  useCases = [
    {
      title: 'Client onboarding',
      description:
        'Collect project details, agreement acceptance, approvals, and signatures before work starts.',
    },
    {
      title: 'Freelancer agreements',
      description:
        'Send one flow to gather contractor details, contract acceptance, and signed confirmation.',
    },
    {
      title: 'Vendor onboarding',
      description:
        'Standardize how partners submit business details, approvals, and signatures in one process.',
    },
  ];

  workflowGrid = [
    {
      title: 'Build your workflow',
      description: 'Custom fields, agreements, required steps, signatures.',
    },
    {
      title: 'Send one secure link',
      description: 'Recipients complete their part without creating an account.',
    },
    {
      title: 'Track and export',
      description: 'Monitor status and generate a final PDF record.',
    },
  ];

  featureCard = [
    {
      title: 'Track every submission in one place',
      description:
        'Keep responses, recipient details, statuses, and completed PDFs organized in a clean dashboard.',
      image: 'Documents-pana.svg',
      alt: 'Submission tracking dashboard',
    },
    {
      title: 'Build flexible form workflows',
      description:
        'Create flows with custom fields, required steps, agreements, checkboxes, and signatures',
      image: 'dashboard-customize.svg',
      alt: 'Custom branded PDF documents',
    },
    {
      title: 'Customize PDFs with your brand',
      description:
        'Add your logo, adjust colors, and generate PDF records that match your brand identity',
      image: 'Setup-bro.svg',
      alt: 'Custom submission flow builder',
    },
    {
      title: 'Send secure, one-time access links',
      description:
        'Share protected links with expiration and access control so only the intended recipient can complete the submission.',
      image: 'Privacy policy-bro.svg',
      alt: 'Secure external access',
    },
    {
      title: 'No account required for recipients',
      description:
        'Let users complete forms and sign instantly in the browser without creating an account.',
      image: 'My-password-bro.svg',
      alt: 'Easy recipient experience',
    },
    {
      title: 'Control required steps and flow logic',
      description:
        'Ensure submissions follow your process with required fields, agreements, and validations.',
      image: 'Agreement-amico.svg',
      alt: 'Required fields and flow logic',
    },
    {
      title: 'Send automatic reminders',
      description:
        'Keep submissions moving by automatically reminding recipients to complete pending forms.',
      image: 'dashboard-reminder.svg',
      alt: 'Automatic reminders',
    },
    {
      title: 'Automatically generate and send PDFs',
      description:
        'Completed documents are instantly converted into PDFs and securely delivered via email.',
      image: 'Transfer-files-amico.svg',
      alt: 'Final PDF export',
    },
  ];

  processSteps = [
    {
      title: 'Build your flow',
      description: 'Create the form, agreement, and signature steps for your workflow.',
      image: 'dashboard-formbuilder.png',
    },
    {
      title: 'Add your content',
      description: 'Set your content with a rich editor.',
      image: 'dashboard-formbuilder-intro.jpeg',
    },
    {
      title: 'Fill your part',
      description: 'Fill in the fields in the form I created.',
      image: 'dashboard-sign-your-part.jpeg',
    },
    {
      title: 'Send one link',
      description: 'Share a secure link so your client can open the full flow in one place.',
      image: 'dashboard-link.jpeg',
    },
    {
      title: 'Client reviews and fills',
      description: 'Your client completes fields, reviews the agreement, and confirms details.',
      image: 'dashboard-external-sign.jpeg',
    },
    {
      title: 'Sign and complete',
      description: 'Capture signatures and generate the final PDF record once everything is done.',
      image: 'completed.jpeg',
    },
  ];

  constructor(private readonly seoService: SeoService) {}

  ngOnInit() {
    this.seoService.setLandingPage();
  }

  setActiveStep(index: number) {
    this.activeStep = index;
  }
}
