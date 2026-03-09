import { Component, Input } from '@angular/core';
import { Timeline } from '../../models/timeline.model';
import { MatIcon } from "@angular/material/icon";
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  imports: [MatIcon, NgClass],
})
export class TimelineComponent {
  @Input() item!: Timeline
}
