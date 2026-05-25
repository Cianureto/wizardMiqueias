const express = require('express');
const { buscarPersonagens } = require('../services/potterApi');
const { construirPersonagem, embaralhar } = require('../services/statsCalculator');
const { cartasNoPack } = require('../constants');

const router = express.Router();

router.get('/pack', async (req, res) => {
  try {
    const dados = await buscarPersonagens();
    const personagens = [];

    for (let i = 0; i < dados.data.length; i += 1) {
      const personagem = dados.data[i];
      const atributos = personagem.attributes;
      if (atributos.name && atributos.name !== '' && atributos.image) {
        personagens.push(construirPersonagem(personagem, atributos));
      }
    }

    res.json({ cards: embaralhar(personagens).slice(0, cartasNoPack) });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).json({ error: 'erro ao buscar personagens' });
  }
});

module.exports = router;
