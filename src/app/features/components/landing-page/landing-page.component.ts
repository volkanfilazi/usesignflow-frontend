import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  standalone: false,
})
export class LandingPageComponent {
  activeStep = 0;

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

  setActiveStep(index: number) {
    this.activeStep = index;
  }
}
