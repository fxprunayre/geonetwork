import { Component } from '@angular/core';
import { FirstSection } from './first-section/first-section';
import { SecondSection } from './second-section/second-section';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FirstSection, SecondSection],
  templateUrl: './home-component.html',
})
export class HomeComponent {}
