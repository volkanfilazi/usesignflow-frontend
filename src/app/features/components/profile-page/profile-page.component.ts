import { Component, OnInit } from '@angular/core';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { InitialsPipe } from "../../../shared/pipes/InitialsPipe";

@Component({
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  imports: [InitialsPipe],
})
export class ProfilePageComponent implements OnInit {
  email = '';
  fullName = '';
  isVerified = false;
  constructor(private readonly authState: AuthStateService) {}

  ngOnInit() {
    this.email = this.authState.getEmail() ?? '';
    this.fullName = this.authState.getFullName() ?? 'User';
    this.isVerified = this.authState.getIsVerified()
  }
}
