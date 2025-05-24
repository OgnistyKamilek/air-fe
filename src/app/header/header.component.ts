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

    function openMenu() {
      if (!(mobileNav instanceof HTMLElement) || !(burgerIcon instanceof HTMLElement)) return;

      mobileNav.style.display = 'block';
      // wymuszamy repaint żeby animacja ruszyła
      void mobileNav.offsetWidth;
      mobileNav.classList.add('active');
      burgerIcon.classList.add('active');
      burgerIcon.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      if (!(mobileNav instanceof HTMLElement) || !(burgerIcon instanceof HTMLElement)) return;

      mobileNav.classList.remove('active');
      burgerIcon.classList.remove('active');
      burgerIcon.setAttribute('aria-expanded', 'false');

      // Po zakończeniu animacji (300ms) ukrywamy display
      setTimeout(() => {
        mobileNav.style.display = 'none';
      }, 300);
    }

    function showDesktopMenu() {
      if (!(mobileNav instanceof HTMLElement) || !(burgerIcon instanceof HTMLElement)) return;

      mobileNav.classList.remove('active');
      mobileNav.style.display = '';
      burgerIcon.classList.remove('active');
      burgerIcon.setAttribute('aria-expanded', 'false');
    }

    function setupInitialState() {
      if (!(mobileNav instanceof HTMLElement) || !(burgerIcon instanceof HTMLElement)) return;

      if (window.innerWidth > 1024) {
        showDesktopMenu();
      } else {
        mobileNav.style.display = 'none';
        mobileNav.classList.remove('active');
        burgerIcon.classList.remove('active');
        burgerIcon.setAttribute('aria-expanded', 'false');
      }
    }
    if (mobileNav instanceof HTMLElement && burgerIcon instanceof HTMLElement) {
      // Kliknięcie burgera - otwieranie / zamykanie menu

      setupInitialState();

      burgerIcon.addEventListener('click', () => {
        const isMobile = window.innerWidth <= 1024;
        
        if (!isMobile) return;

        if (mobileNav.classList.contains('active')) {
            closeMenu();
          } else {
            openMenu();
          }
       
      });
      
    // Usuwanie burgera po przejściu na normalny widok
      window.addEventListener('resize', () => {

        if (window.innerWidth > 1024) {
          showDesktopMenu();
        } else {
          closeMenu();
        }
         
      });
      // Zamykanie po kliknięciu w dowolny link w menu
      const navLinks = document.querySelectorAll('.main-nav ul li a');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          closeMenu();
        });
      });

      // Zamykanie menu po kliknięciu poza burgerem i navem
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const clickedOutside = !mobileNav.contains(target) && !burgerIcon.contains(target);
      
        if (clickedOutside && mobileNav.classList.contains('active')) {
          closeMenu();
        }
      });
    } else {
      console.error('Elementy nie zostały znalezione w DOM.');
    }
     
   
    

  }
}
