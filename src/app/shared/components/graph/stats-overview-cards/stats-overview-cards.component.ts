import { Component, Input } from '@angular/core';
import { StatsOverviewCard } from '../../../models/graph.model';

@Component({
  selector: 'app-stats-overview-cards',
  templateUrl: './stats-overview-cards.component.html',
  styleUrls: ['./stats-overview-cards.component.scss'],
  standalone: false,
})
export class StatsOverviewCardsComponent {
  @Input() cards: StatsOverviewCard[] = [];
}