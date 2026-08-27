import { Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    private title: Title,
    private meta: Meta
  ) {}

  setLandingPage(): void {
    this.title.setTitle(
      'SignFlow – Forms, Approvals & E-Signatures in One Workflow'
    );

    this.meta.updateTag({
      name: 'description',
      content:
        'Build structured workflows to collect client details, agreements, approvals, and signatures.'
    });
  }
}