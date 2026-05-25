const express = require('express');
const { buscarPersonagens } = require('../services/potterApi');
const { construirPersonagem, embaralhar } = require('../services/statsCalculator');
const { cartasNoDeckCpu } = require('../constants');

const router = express.Router();

router.post('/cpu-deck', async (req, res) => {
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

    res.json({ deck: embaralhar(personagens).slice(0, cartasNoDeckCpu) });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).json({ error: 'erro ao montar deck cpu' });
  }
});

module.exports = router;
