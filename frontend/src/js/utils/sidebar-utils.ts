export class Sidebar {
    protected sidebarElement:HTMLElement | null;
    protected sidebarTogglerElement:HTMLElement | null 
   constructor() {
       this.sidebarElement = document.getElementById('sidebar');
       this.sidebarTogglerElement = document.getElementById('sidebar_toggler');
       
       if (this.sidebarTogglerElement && this.sidebarElement) {
           this.sidebarTogglerElement.addEventListener('click', this.toggleSidebar.bind(this));
       }
   }

  protected toggleSidebar():void {
    if (this.sidebarTogglerElement && this.sidebarElement){
        this.sidebarElement.classList.toggle('show');
        this.sidebarTogglerElement.classList.toggle('nav-open');
    }
      
   }

   
}

