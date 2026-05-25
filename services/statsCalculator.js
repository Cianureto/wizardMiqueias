const {
  poderPadrao,
  poderGryffindor,
  poderSlytherin,
  poderHufflepuff,
  poderRavenclaw,
  magiaPadrao,
  magiaHumano,
  magiaMeioGigante,
  magiaGigante,
  magiaElfo,
  magiaFantasma,
  magiaLobisomem,
  magiaVampiro,
  magiaCentauro,
  defesaPadrao,
  defesaSanguePuro,
  defesaMeioSangue,
  defesaNascidoTrouxa,
  defesaTrouxa,
  defesaSquib,
  variacaoHp,
  hpBase,
} = require('../constants');

function calcularAtributos(atributos) {
  let poder = poderPadrao;
  if (atributos.house === 'Gryffindor') poder = poderGryffindor;
  if (atributos.house === 'Slytherin') poder = poderSlytherin;
  if (atributos.house === 'Hufflepuff') poder = poderHufflepuff;
  if (atributos.house === 'Ravenclaw') poder = poderRavenclaw;

  let magia = magiaPadrao;
  if (atributos.species === 'human') magia = magiaHumano;
  if (atributos.species === 'half-giant') magia = magiaMeioGigante;
  if (atributos.species === 'giant') magia = magiaGigante;
  if (atributos.species === 'house elf') magia = magiaElfo;
  if (atributos.species === 'ghost') magia = magiaFantasma;
  if (atributos.species === 'werewolf') magia = magiaLobisomem;
  if (atributos.species === 'vampire') magia = magiaVampiro;
  if (atributos.species === 'centaur') magia = magiaCentauro;

  let defesa = defesaPadrao;
  if (atributos.ancestry === 'pure-blood') defesa = defesaSanguePuro;
  if (atributos.ancestry === 'half-blood') defesa = defesaMeioSangue;
  if (atributos.ancestry === 'muggle-born') defesa = defesaNascidoTrouxa;
  if (atributos.ancestry === 'muggle') defesa = defesaTrouxa;
  if (atributos.ancestry === 'squib') defesa = defesaSquib;

  return { poder, magia, defesa };
}

function construirPersonagem(personagem, atributos) {
  const { poder, magia, defesa } = calcularAtributos(atributos);
  const hp = defesa + Math.floor(Math.random() * variacaoHp) + hpBase;

  return {
    id: personagem.id,
    name: atributos.name,
    house: atributos.house || 'Unknown',
    species: atributos.species || 'Unknown',
    ancestry: atributos.ancestry || 'Unknown',
    image: atributos.image,
    power: poder,
    magic: magia,
    defense: defesa,
    hp,
    maxHp: hp,
  };
}

function embaralhar(lista) {
  const copia = [...lista];
  for (let indice = copia.length - 1; indice > 0; indice -= 1) {
    const indiceAleatorio = Math.floor(Math.random() * (indice + 1));
    const temporario = copia[indice];
    copia[indice] = copia[indiceAleatorio];
    copia[indiceAleatorio] = temporario;
  }
  return copia;
}

module.exports = { calcularAtributos, construirPersonagem, embaralhar };
