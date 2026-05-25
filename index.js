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
const { calcularAtributos, embaralhar } = require('./services/statsCalculator');

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
      if (atributos.name && atributos.name !== '' && atributos.image) {
        const { poder, magia, defesa } = calcularAtributos(atributos);
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
    }

    res.json({ cards: embaralhar(personagens).slice(0, cartasNoPack) });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
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
      if (atributos.name && atributos.name !== '') {
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
    }

    res.json({ spells: embaralhar(feiticos).slice(0, totalFeiticos) });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
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
      if (atributos.name && atributos.name !== '' && atributos.image) {
        const { poder, magia, defesa } = calcularAtributos(atributos);
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
    }

    res.json({ deck: embaralhar(personagens).slice(0, cartasNoDeckCpu) });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).json({ error: 'erro ao montar deck cpu' });
  }
});

app.listen(3000);
