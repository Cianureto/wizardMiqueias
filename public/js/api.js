async function fetchPack() {
  const resposta = await fetch('/api/pack');
  const dados = await resposta.json();
  return dados.cards;
}

async function fetchSpells() {
  const resposta = await fetch('/api/spells');
  const dados = await resposta.json();
  return dados.spells;
}

async function fetchCpuDeck() {
  const resposta = await fetch('/api/cpu-deck', { method: 'POST' });
  const dados = await resposta.json();
  return dados.deck;
}
