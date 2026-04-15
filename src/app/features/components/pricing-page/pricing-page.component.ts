import { Component } from '@angular/core';
import { plans } from '../../models/billing.model';

@Component({
  selector: 'app-pricing-page',
  templateUrl: './pricing-page.component.html',
  standalone: false,
  styleUrls: ['./pricing-page.component.scss'],
})
export class PricingPageComponent {
  plans = plans;
  
  billingCycle: 'monthly' | 'yearly' = 'monthly';

  get proPrice(): string {
    return this.billingCycle === 'monthly' ? '$15' : '$144';
  }

  get proPriceNote(): string {
    return this.billingCycle === 'monthly' ? '/ month' : '/ year';
  }

  get proSavingsText(): string {
    return this.billingCycle === 'monthly' ? 'Best for solo professionals' : 'Save $36 per year';
  }

  get proCtaText(): string {
    return this.billingCycle === 'monthly' ? 'Start Pro' : 'Start Pro Yearly';
  }

  get businessPrice(): string {
    return this.billingCycle === 'monthly' ? '$29' : '$276';
  }

  get businessPriceNote(): string {
    return this.billingCycle === 'monthly' ? '/ month' : '/ year';
  }

  get businessSavingsText(): string {
    return this.billingCycle === 'monthly' ? 'For growing client workflows' : 'Save $72 per year';
  }

  setBillingCycle(cycle: 'monthly' | 'yearly') {
    this.billingCycle = cycle;
  }
}
