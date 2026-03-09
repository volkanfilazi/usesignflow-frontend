import { Component } from '@angular/core';
import { Timeline } from '../../../shared/models/timeline.model';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss',
  standalone: false,
})
export class ResumeComponent {
  protected selected = 0;
  protected downloadSelected = 0;
  protected loadingPdf = true;

  works: Timeline[] = [
    {
      time: [
        {
          deadline: '',
          date: 'August 2021',
          untilToday: '2 years 3 months',
          type: 'Full-Time',
        },
      ],
      logo: 'https://media.licdn.com/dms/image/v2/D4D0BAQFd935B3l4P5g/company-logo_100_100/company-logo_100_100/0/1695195710804/loidl_consulting_it_services_logo?e=1774483200&v=beta&t=Vdzv62SvWtr_b-FIMftcT0DV0G8oVGF22U9UJ8siaPE',
      company: 'Loidl Consulting & IT Services GmbH · Full-time',
      location: 'Vienna, Austria',
      side: 'On-site',
      key: 'Software developer',
      role: 'Frontend Developer – Angular & Test Automation',
      descriptions: [
        'Development and maintenance of a modular health tech platform for the digitalization of nursing and care processes in Austria.',
        'Implementation of complex frontend features within a microservice architecture with a fine-grained authorization system.',
        'Led Angular framework version upgrades (v14 → v18) ensuring compatibility, dependency updates, and smooth migration across the application.',
        'Close collaboration with backend, product, and UX teams to implement technically demanding requirements.',
        'Design and development of an activity timeline that centrally and auditably displays user-specific actions (documents, emails, calendar events).',
        'Implementation of a document and email module for internal and external communication, including dependent document links.',
        'Integration of rich text editors, file uploads, user tagging, and cross-system feature integration.',
        'Ensuring code quality through automated tests (Cypress) and a structured component architecture.',
      ],
      date: '2024-01-01',
    },
    {
      time: [
        {
          deadline: 'January 2024',
          date: 'July 2023',
          untilToday: '7 months',
          type: 'Freelance',
        },
      ],
      logo: '/images/WirHelfen_Magazin_logo.png',
      company: 'Wirhelfen.eu · Full-time',
      location: 'München, Germany',
      side: 'Remote (Voluntarily)',
      key: 'Software Developer',
      role: 'Fullstack Cross-Platform Mobile Application',
      descriptions: [
        'Development of a mobile platform that helps people offer and find assistance.',
        'Responsibility for frontend and backend development, including authentication, map integration, donation system, and chat functionality.',
        'Close collaboration with UI/UX designers (Figma) throughout all project phases.',
      ],
      date: '2024-01-01',
    },
    {
      time: [
        {
          deadline: 'March 2023',
          date: 'August 2021',
          untilToday: '1 years 8 months',
          type: 'Part-Time',
        },
      ],
      logo: '',
      company: 'F & I Anadolu Backshop GmbH · Part-time',
      location: 'Vienna, Austria',
      side: 'On-site',
      key: 'Ladner',
      role: 'Sales and warehouse',
      descriptions: [],
      date: '2024-01-01',
    },
    {
      time: [
        {
          deadline: 'September 2011',
          date: 'May 2009',
          untilToday: '2 years 5 months',
          type: 'Full-Time',
        },
      ],
      logo: '',
      company: 'VOLSER YAPI SPOR GIDA TEMİZLİK SAN.TİC.LTD. ŞTİ. · Self-employed',
      location: 'Adana, Türkiye',
      side: 'On-site',
      key: 'Company Partner',
      role: 'Owner/Partner',
      descriptions: [],
      date: '2024-01-01',
    },
  ];

  education: Timeline[] = [
    {
      time: [
        {
          deadline: 'March 2023',
          date: 'October 2022',
          untilToday: '',
          type: '',
        },
      ],
      logo: 'https://media.licdn.com/dms/image/v2/C560BAQGMCVKm-McPEg/company-logo_100_100/company-logo_100_100/0/1630621829734/fachhochschule_krnten_logo?e=1774483200&v=beta&t=r7o6PBynagZ9iojZyB4U4leDDWShT_TmwDZsi1GfKoc',
      company: 'Fachhochschule Kärnten',
      location: 'Vienna, Austria',
      side: '',
      key: 'Moden Web Development',
      role: '',
      descriptions: [],
      date: '2024-01-01',
    },
    {
      time: [
        {
          deadline: 'March 2021',
          date: 'October 2020',
          untilToday: '',
          type: '',
        },
      ],
      logo: 'https://media.licdn.com/dms/image/v2/C560BAQGMCVKm-McPEg/company-logo_100_100/company-logo_100_100/0/1630621829734/fachhochschule_krnten_logo?e=1774483200&v=beta&t=r7o6PBynagZ9iojZyB4U4leDDWShT_TmwDZsi1GfKoc',
      company: 'Fachhochschule Kärnten',
      location: 'Vienna, Austria',
      side: '',
      key: 'Mobile Application Development',
      role: '',
      descriptions: [],
      date: '2024-01-01',
    },
    {
      time: [
        {
          deadline: 'July 2020',
          date: 'February 2020',
          untilToday: '',
          type: '',
        },
      ],
      logo: 'https://media.licdn.com/dms/image/v2/D4D0BAQEkM46uHjktqg/company-logo_100_100/B4DZesTqeRHMAU-/0/1750942525883/wifiwien_logo?e=1774483200&v=beta&t=M7NkQxdmVRM8e7kNzrkybtzOttfCOxbRS7YixkKE0Bk',
      company: 'WIFI Wien',
      location: 'Vienna, Austria',
      side: '',
      key: 'Mobile Application Development',
      role: '',
      descriptions: [],
      date: '2024-01-01',
    },
    {
      time: [
        {
          deadline: 'June 2017',
          date: 'March 2011',
          untilToday: '',
          type: '',
        },
      ],
      logo: 'https://media.licdn.com/dms/image/v2/D4D0BAQEpxjrbNnjHyw/company-logo_100_100/B4DZeMHfzkHAAQ-/0/1750402465450/tuwien_logo?e=1774483200&v=beta&t=QKngaWUsWatKYQ2aNhe8XGKP6mDf8rghQZ1L-ArWrKw',
      company: 'Technische Universität Wien',
      location: 'Vienna, Austria',
      side: '',
      key: 'Architecture',
      role: '',
      descriptions: [],
      date: '2024-01-01',
    },
  ];

  onPdfLoad() {
    this.loadingPdf = false;
  }
}
