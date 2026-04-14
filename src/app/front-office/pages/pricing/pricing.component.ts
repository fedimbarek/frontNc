import { Component } from '@angular/core';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent {

  plans = [
    {
      name: 'Occasionnel',
      desc: 'Parfait pour jouer de temps en temps',
      emoji: '🎾',
      iconBg: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
      price: 'Gratuit',
      period: '',
      featured: false,
      cta: 'Réserver un terrain',
      features: [
        'Accès aux terrains disponibles',
        'Réservation en ligne',
        'Vestiaires inclus',
        'Annulation gratuite 2h avant'
      ]
    },
    {
      name: 'Abonnement Mensuel',
      desc: 'Pour les joueurs réguliers',
      emoji: '🏆',
      iconBg: 'linear-gradient(135deg, #1a472a, #2d6a42)',
      price: '149',
      period: 'mois',
      featured: true,
      cta: 'Choisir cette formule',
      features: [
        '8 réservations / mois',
        'Accès prioritaire aux créneaux',
        'Vestiaires & équipements inclus',
        'Annulation gratuite 1h avant',
        'Accès aux tournois membres',
        '-10% sur les cours de coaching'
      ]
    },
    {
      name: 'Pass Annuel',
      desc: 'Le meilleur rapport qualité-prix',
      emoji: '👑',
      iconBg: 'linear-gradient(135deg, #c45c1a, #e07a40)',
      price: '999',
      period: 'an',
      featured: false,
      cta: 'Choisir cette formule',
      features: [
        'Réservations illimitées',
        'Accès VIP 24h/24 7j/7',
        'Coach personnel (2 séances/mois)',
        'Annulation sans conditions',
        'Accès à tous les tournois',
        'Équipement en prêt gratuit',
        'Invités gratuits (2/mois)'
      ]
    }
  ];
}