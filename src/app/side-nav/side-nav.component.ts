import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css'] 
})
export class SideNavComponent {
  mobileScreen = window.matchMedia('(max-width: 990px)');
  dropdownStates: { [key: string]: boolean } = {
    taskDropdown: false,
    usersDropdown: false,
    meetingsDropdown: false,
  };

  constructor(private renderer: Renderer2, private el: ElementRef) {
    this.mobileScreen.addEventListener('change', this.updateMenu.bind(this));
  }

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement: HTMLElement) {
    if (!targetElement.closest('.dashboard-nav-dropdown-toggle')) {
      this.closeAllDropdowns();
    }
  }

  closeAllDropdowns() {
    for (const key in this.dropdownStates) {
      if (this.dropdownStates.hasOwnProperty(key)) {
        this.dropdownStates[key] = false;
      }
    }
  }

  toggleMenu() {
    if (this.mobileScreen.matches) {
      const dashboardNav = document.querySelector('.dashboard-nav');
      if (dashboardNav) {
        this.renderer.addClass(dashboardNav, 'mobile-show');
      }
    } else {
      const dashboard = document.querySelector('.dashboard');
      if (dashboard) {
        this.renderer.removeClass(dashboard, 'dashboard-compact');
      }
    }
  }
  

  updateMenu() {
    if (!this.mobileScreen.matches) {
      const dashboardNav = document.querySelector('.dashboard-nav');
      if (dashboardNav) {
        this.renderer.removeClass(dashboardNav, 'mobile-show');
      }
    }
  }

  toggleDropdown(event: Event, dropdownType: string) {
    event.preventDefault(); // Prevent default behavior of anchor tag
    event.stopPropagation(); // Stop event propagation to parent elements
  
    for (const key in this.dropdownStates) {
      if (this.dropdownStates.hasOwnProperty(key) && key !== dropdownType) {
        this.dropdownStates[key] = false;
      }
    }
  
    this.dropdownStates[dropdownType] = !this.dropdownStates[dropdownType];
  }
  
  
}