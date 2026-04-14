import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-testimoni',
  templateUrl: './testimoni.component.html',
  styleUrl: './testimoni.component.scss'
})
export class TestimoniComponent implements AfterViewInit {

  @ViewChild('swiperContainer', { static: false }) swiperContainer!: ElementRef;

  currentSlide = 0;

  listTestimoni = [
    {
      name: 'Karim Mansouri',
      image: 'assets/people-1.png',
      city: 'Tunis',
      country: 'Tunisie',
      rating: '5.0',
      testimoni:
        'Les terrains sont impeccables et la réservation en ligne est super simple. Je joue ici chaque semaine avec mon équipe, on adore l\'ambiance et le professionnalisme des coachs.'
    },
    {
      name: 'Sana Belhadj',
      image: 'assets/people-2.png',
      city: 'Sousse',
      country: 'Tunisie',
      rating: '4.5',
      testimoni:
        'J\'ai commencé le padel ici il y a 6 mois en tant que débutante. Grâce aux coachs certifiés, j\'ai progressé très rapidement. Je recommande vraiment cette académie !'
    },
    {
      name: 'Mohamed Trabelsi',
      image: 'assets/people-3.png',
      city: 'Sfax',
      country: 'Tunisie',
      rating: '5.0',
      testimoni:
        'Meilleure académie de padel en Tunisie. Les installations sont de niveau international et les tournois organisés sont top. L\'abonnement mensuel est vraiment rentable.'
    },
    {
      name: 'Leila Chaabane',
      image: 'assets/people-1.png',
      city: 'Tunis',
      country: 'Tunisie',
      rating: '4.5',
      testimoni:
        'Le système de réservation en ligne est très pratique. J\'apprécie particulièrement la disponibilité des terrains le soir et le week-end. Service client au top !'
    },
    {
      name: 'Yassine Bouazizi',
      image: 'assets/people-2.png',
      city: 'Nabeul',
      country: 'Tunisie',
      rating: '5.0',
      testimoni:
        'J\'ai pris l\'abonnement annuel et je ne regrette pas du tout. Le coaching personnalisé a vraiment transformé mon jeu. L\'atmosphère est toujours conviviale et motivante.'
    }
  ];

  ngAfterViewInit(): void {
    const swiperEl = this.swiperContainer?.nativeElement;
    if (!swiperEl) return;

    Object.assign(swiperEl, {
      slidesPerView: 3,
      slidesPerGroup: 1,
      spaceBetween: 24,
      pagination: { clickable: true, dynamicBullets: true },
      navigation: false,
      loop: false,
      speed: 500,
      on: {
        slideChange: (swiper: any) => {
          this.currentSlide = swiper.activeIndex;
        }
      },
      breakpoints: {
        0:    { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 16 },
        640:  { slidesPerView: 2, slidesPerGroup: 1, spaceBetween: 20 },
        1024: { slidesPerView: 3, slidesPerGroup: 1, spaceBetween: 24 }
      }
    });

    swiperEl.initialize();
  }

  goToPrevSlide(): void {
    const swiperEl = this.swiperContainer?.nativeElement;
    if (swiperEl?.swiper) {
      swiperEl.swiper.slidePrev();
      this.currentSlide = swiperEl.swiper.activeIndex;
    }
  }

  goToNextSlide(): void {
    const swiperEl = this.swiperContainer?.nativeElement;
    if (swiperEl?.swiper) {
      swiperEl.swiper.slideNext();
      this.currentSlide = swiperEl.swiper.activeIndex;
    }
  }

  // Génère un tableau de 5 étoiles selon le rating
  getStars(rating: string): number[] {
    const r = parseFloat(rating);
    return Array(5).fill(0).map((_, i) => i < Math.round(r) ? 1 : 0);
  }
}