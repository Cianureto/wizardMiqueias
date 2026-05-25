const fetch = require('node-fetch');
const { tamanhoPagina, totalPaginas } = require('../constants');

async function buscarPersonagens() {
  const numeroPagina = Math.floor(Math.random() * totalPaginas) + 1;
  const resposta = await fetch(`https://api.potterdb.com/v1/characters?page[size]=${tamanhoPagina}&page[number]=${numeroPagina}`);
  return resposta.json();
}

async function buscarFeiticos() {
  const resposta = await fetch(`https://api.potterdb.com/v1/spells?page[size]=${tamanhoPagina}`);
  return resposta.json();
}

module.exports = { buscarPersonagens, buscarFeiticos };
