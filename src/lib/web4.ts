import Cookies from 'js-cookie';

export function isSignedIn() {
  console.log('isSignedIn', Cookies.get('web4_account_id'));
  return !!Cookies.get('web4_account_id');
}

export function getAccountId() {
  console.log('getAccountId', Cookies.get('web4_account_id'));
  return Cookies.get('web4_account_id');
}

// export function getSigner() {
//     const keyStore = new InMemoryKeyStore();
//     // TODO: Handle no key for logged in users
//     let privateKey = isSignedIn() ? Cookies.get('web4_private_key') : localStorage.getItem('anon_private_key');
//     if (!privateKey) {
//         privateKey = KeyPair.fromRandom('ed25519').toString();
//         localStorage.setItem('anon_private_key', privateKey);
//     }
//     keyStore.setKey(NETWORK_ID, getAccountId(), KeyPair.fromString(privateKey));
//     return new InMemorySigner(keyStore);
// }