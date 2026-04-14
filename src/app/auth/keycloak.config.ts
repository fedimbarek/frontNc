import Keycloak from 'keycloak-js';

let keycloak: Keycloak;

export function initKeycloak(): Promise<boolean> {
  keycloak = new Keycloak({
    url: 'https://thanks-bidding-arrangements-step.trycloudflare.com',
    realm: 'jungleinenglish-realm',
    clientId: 'jungleinenglish-frontend'
  });

  return keycloak.init({
    onLoad: 'check-sso',
    checkLoginIframe: false
  });
}

export function getKeycloak() {
  return keycloak;
}
