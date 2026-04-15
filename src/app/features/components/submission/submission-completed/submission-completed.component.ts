import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-submission-completed',
  templateUrl: './submission-completed.component.html',
  styleUrl: './submission-completed.component.scss',
  standalone: true,
  imports: [MatIcon],
})
export class SubmissionCompletedComponent {
  constructor(private readonly route: ActivatedRoute) {}
}
