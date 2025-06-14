import {Component} from '@angular/core';
import {SearchbarComponent} from '../searchbar/searchbar.component';
import {ApiMapComponent} from '../api-map/api-map.component';
import {ArticlesComponent} from '../articles/articles.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchbarComponent, ApiMapComponent, ArticlesComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
}
