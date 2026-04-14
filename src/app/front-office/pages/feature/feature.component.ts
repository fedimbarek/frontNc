import { Component } from '@angular/core';

@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  styleUrl: './feature.component.scss'
})
export class FeatureComponent {

  availableCourts = 5;

  features: { title: string; desc: string }[] = [
    {
      title: 'Terrains couverts & éclairés',
      desc: 'Jouez à toute heure, par tous les temps, sur des terrains aux normes professionnelles.'
    },
    {
      title: 'Coachs certifiés',
      desc: 'Progressez avec nos entraîneurs diplômés, adaptés à tous les niveaux.'
    },
    {
      title: 'Réservation en 2 minutes',
      desc: 'Réservez votre terrain en ligne, 7j/7, sans attente ni appel téléphonique.'
    },
    {
      title: 'Tournois & événements',
      desc: 'Participez à nos compétitions mensuelles et rejoignez une communauté active.'
    },
    {
      title: 'Équipement disponible sur place',
      desc: 'Raquettes et balles en location, boutique et vestiaires à disposition.'
    }
  ];
}