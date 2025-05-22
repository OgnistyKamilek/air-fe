import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  ngOnInit(): void {
    const mobileNav = document.querySelector('.main-nav ul');
    const burgerIcon = document.querySelector('.burger-linie');

    if (mobileNav instanceof HTMLElement && burgerIcon instanceof HTMLElement) {
      burgerIcon.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        burgerIcon.classList.toggle('active');
      });
    } else {
      console.error('Elementy nie zostały znalezione w DOM.');
    }
  }
}
