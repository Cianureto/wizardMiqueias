const express = require('express');
const fetch = require('node-fetch');
const {
  totalPaginas,
  tamanhoPagina,
  cartasNoPack,
  cartasNoDeckCpu,
  totalFeiticos,
  variacaoHp,
  hpBase,
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
  danoPadrao,
  danoCharm,
  danoCurse,
  danoHex,
  danoJinx,
  danoSpell,
  danoTransfiguracao,
  danoContraFeitico,
  danoCura,
} = require('./constants');

const app = express();
app.use(express.static('public'));
app.use(express.json());

// pega pack de cartas aleatorias
app.get('/api/pack', async (req, res) => {
  try {
    const numeroPagina = Math.floor(Math.random() * totalPaginas) + 1;
    const resposta = await fetch(`https://api.potterdb.com/v1/characters?page[size]=${tamanhoPagina}&page[number]=${numeroPagina}`);
    const dados = await resposta.json();

    const personagens = [];
    for (let i = 0; i < dados.data.length; i += 1) {
      const personagem = dados.data[i];
      const atributos = personagem.attributes;
      if (!atributos.name || atributos.name === '' || !atributos.image) continue;

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

      const hp = defesa + Math.floor(Math.random() * variacaoHp) + hpBase;

      const carta = {};
      carta.id = personagem.id;
      carta.name = atributos.name;
      carta.house = atributos.house || 'Unknown';
      carta.species = atributos.species || 'Unknown';
      carta.ancestry = atributos.ancestry || 'Unknown';
      carta.image = atributos.image;
      carta.power = poder;
      carta.magic = magia;
      carta.defense = defesa;
      carta.hp = hp;
      carta.maxHp = hp;

      personagens.push(carta);
    }

    // embaralha
    for (let indice = personagens.length - 1; indice > 0; indice -= 1) {
      const indiceAleatorio = Math.floor(Math.random() * (indice + 1));
      const temporario = personagens[indice]; personagens[indice] = personagens[indiceAleatorio]; personagens[indiceAleatorio] = temporario;
    }

    // retorna 4 cartas
    res.json({ cards: personagens.slice(0, cartasNoPack) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'erro ao buscar personagens' });
  }
});

// pega feiticos disponiveis
app.get('/api/spells', async (req, res) => {
  try {
    const resposta = await fetch(`https://api.potterdb.com/v1/spells?page[size]=${tamanhoPagina}`);
    const dados = await resposta.json();

    const feiticos = [];
    for (let i = 0; i < dados.data.length; i += 1) {
      const feitico = dados.data[i];
      const atributos = feitico.attributes;
      if (!atributos.name || atributos.name === '') continue;

      let dano = danoPadrao;
      if (atributos.category === 'Charm') dano = danoCharm;
      if (atributos.category === 'Curse') dano = danoCurse;
      if (atributos.category === 'Hex') dano = danoHex;
      if (atributos.category === 'Jinx') dano = danoJinx;
      if (atributos.category === 'Spell') dano = danoSpell;
      if (atributos.category === 'Transfiguration') dano = danoTransfiguracao;
      if (atributos.category === 'Counter-spell') dano = danoContraFeitico;
      if (atributos.category === 'Healing spell') dano = danoCura;

      const carta = {};
      carta.id = feitico.id;
      carta.name = atributos.name;
      carta.effect = atributos.effect || 'Efeito desconhecido';
      carta.category = atributos.category || 'Spell';
      carta.light = atributos.light || 'Unknown';
      carta.damage = dano;

      feiticos.push(carta);
    }

    // embaralha e retorna 20
    for (let indice = feiticos.length - 1; indice > 0; indice -= 1) {
      const indiceAleatorio = Math.floor(Math.random() * (indice + 1));
      const temporario = feiticos[indice]; feiticos[indice] = feiticos[indiceAleatorio]; feiticos[indiceAleatorio] = temporario;
    }

    res.json({ spells: feiticos.slice(0, totalFeiticos) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'erro ao buscar feiticos' });
  }
});

// monta deck cpu com personagens aleatorios
app.post('/api/cpu-deck', async (req, res) => {
  try {
    const numeroPagina = Math.floor(Math.random() * totalPaginas) + 1;
    const resposta = await fetch(`https://api.potterdb.com/v1/characters?page[size]=${tamanhoPagina}&page[number]=${numeroPagina}`);
    const dados = await resposta.json();

    const personagens = [];
    for (let i = 0; i < dados.data.length; i += 1) {
      const personagem = dados.data[i];
      const atributos = personagem.attributes;
      if (!atributos.name || atributos.name === '' || !atributos.image) continue;

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

      const hp = defesa + Math.floor(Math.random() * variacaoHp) + hpBase;

      const carta = {};
      carta.id = personagem.id;
      carta.name = atributos.name;
      carta.house = atributos.house || 'Unknown';
      carta.species = atributos.species || 'Unknown';
      carta.ancestry = atributos.ancestry || 'Unknown';
      carta.image = atributos.image;
      carta.power = poder;
      carta.magic = magia;
      carta.defense = defesa;
      carta.hp = hp;
      carta.maxHp = hp;

      personagens.push(carta);
    }

    for (let indice = personagens.length - 1; indice > 0; indice -= 1) {
      const indiceAleatorio = Math.floor(Math.random() * (indice + 1));
      const temporario = personagens[indice]; personagens[indice] = personagens[indiceAleatorio]; personagens[indiceAleatorio] = temporario;
    }

    res.json({ deck: personagens.slice(0, cartasNoDeckCpu) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'erro ao montar deck cpu' });
  }
});

app.listen(3000, () => {
  console.log('rodando na porta 3000');
});
