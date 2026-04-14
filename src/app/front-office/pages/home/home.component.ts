import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  // ── Stats animées ─────────────────────────────
  playerCountDisplay = 0;
  courtsDisplay = 0;
  reservationsDisplay = 0;
  satisfactionDisplay = 0;
  availableCourts = 5; // terrains dispo en temps réel (à brancher sur API)

  // Valeurs cibles
  private readonly playerCountTarget    = 500;
  private readonly courtsTarget         = 8;
  private readonly reservationsTarget   = 1200;
  private readonly satisfactionTarget   = 98;

  ngOnInit(): void {
    this.animateStats();
  }

  private animateStats(): void {
    this.animateValue('playerCountDisplay',  this.playerCountTarget,  2000);
    this.animateValue('courtsDisplay',       this.courtsTarget,       1500);
    this.animateValue('reservationsDisplay', this.reservationsTarget, 2500);
    this.animateValue('satisfactionDisplay', this.satisfactionTarget, 2000);
  }

  private animateValue(property: string, target: number, duration: number): void {
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        (this as any)[property] = target;
        clearInterval(timer);
      } else {
        (this as any)[property] = Math.floor(current);
      }
    }, 16);
  }
}