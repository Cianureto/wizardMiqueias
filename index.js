const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.static('public'));
app.use(express.json());

// pega pack de cartas aleatorias
app.get('/api/pack', async (req, res) => {
  try {
    const numeroPagina = Math.floor(Math.random() * 8) + 1;
    const resposta = await fetch(`https://api.potterdb.com/v1/characters?page[size]=100&page[number]=${numeroPagina}`);
    const dados = await resposta.json();

    const personagens = [];
    for (let i = 0; i < dados.data.length; i += 1) {
      const personagem = dados.data[i];
      const atributos = personagem.attributes;
      if (!atributos.name || atributos.name === '' || !atributos.image) continue;

      let poder = 50;
      if (atributos.house === 'Gryffindor') poder = 90;
      if (atributos.house === 'Slytherin') poder = 85;
      if (atributos.house === 'Hufflepuff') poder = 75;
      if (atributos.house === 'Ravenclaw') poder = 80;

      let magia = 50;
      if (atributos.species === 'human') magia = 70;
      if (atributos.species === 'half-giant') magia = 88;
      if (atributos.species === 'giant') magia = 95;
      if (atributos.species === 'house elf') magia = 82;
      if (atributos.species === 'ghost') magia = 60;
      if (atributos.species === 'werewolf') magia = 91;
      if (atributos.species === 'vampire') magia = 87;
      if (atributos.species === 'centaur') magia = 78;

      let defesa = 50;
      if (atributos.ancestry === 'pure-blood') defesa = 90;
      if (atributos.ancestry === 'half-blood') defesa = 75;
      if (atributos.ancestry === 'muggle-born') defesa = 70;
      if (atributos.ancestry === 'muggle') defesa = 40;
      if (atributos.ancestry === 'squib') defesa = 35;

      const hp = defesa + Math.floor(Math.random() * 20) + 80;

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
    res.json({ cards: personagens.slice(0, 4) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'erro ao buscar personagens' });
  }
});

// pega feiticos disponiveis
app.get('/api/spells', async (req, res) => {
  try {
    const resposta = await fetch('https://api.potterdb.com/v1/spells?page[size]=100');
    const dados = await resposta.json();

    const feiticos = [];
    for (let i = 0; i < dados.data.length; i += 1) {
      const feitico = dados.data[i];
      const atributos = feitico.attributes;
      if (!atributos.name || atributos.name === '') continue;

      let dano = 30;
      if (atributos.category === 'Charm') dano = 45;
      if (atributos.category === 'Curse') dano = 90;
      if (atributos.category === 'Hex') dano = 65;
      if (atributos.category === 'Jinx') dano = 55;
      if (atributos.category === 'Spell') dano = 50;
      if (atributos.category === 'Transfiguration') dano = 40;
      if (atributos.category === 'Counter-spell') dano = 35;
      if (atributos.category === 'Healing spell') dano = -40;

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

    res.json({ spells: feiticos.slice(0, 20) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'erro ao buscar feiticos' });
  }
});

// monta deck cpu com personagens aleatorios
app.post('/api/cpu-deck', async (req, res) => {
  try {
    const numeroPagina = Math.floor(Math.random() * 8) + 1;
    const resposta = await fetch(`https://api.potterdb.com/v1/characters?page[size]=100&page[number]=${numeroPagina}`);
    const dados = await resposta.json();

    const personagens = [];
    for (let i = 0; i < dados.data.length; i += 1) {
      const personagem = dados.data[i];
      const atributos = personagem.attributes;
      if (!atributos.name || atributos.name === '' || !atributos.image) continue;

      let poder = 50;
      if (atributos.house === 'Gryffindor') poder = 90;
      if (atributos.house === 'Slytherin') poder = 85;
      if (atributos.house === 'Hufflepuff') poder = 75;
      if (atributos.house === 'Ravenclaw') poder = 80;

      let magia = 50;
      if (atributos.species === 'human') magia = 70;
      if (atributos.species === 'half-giant') magia = 88;
      if (atributos.species === 'giant') magia = 95;
      if (atributos.species === 'house elf') magia = 82;
      if (atributos.species === 'ghost') magia = 60;
      if (atributos.species === 'werewolf') magia = 91;
      if (atributos.species === 'vampire') magia = 87;
      if (atributos.species === 'centaur') magia = 78;

      let defesa = 50;
      if (atributos.ancestry === 'pure-blood') defesa = 90;
      if (atributos.ancestry === 'half-blood') defesa = 75;
      if (atributos.ancestry === 'muggle-born') defesa = 70;
      if (atributos.ancestry === 'muggle') defesa = 40;
      if (atributos.ancestry === 'squib') defesa = 35;

      const hp = defesa + Math.floor(Math.random() * 20) + 80;

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

    res.json({ deck: personagens.slice(0, 2) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'erro ao montar deck cpu' });
  }
});

app.listen(3000, () => {
  console.log('rodando na porta 3000');
});
