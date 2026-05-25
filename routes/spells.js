const express = require('express');
const { buscarFeiticos } = require('../services/potterApi');
const { embaralhar } = require('../services/statsCalculator');
const {
  totalFeiticos,
  danoPadrao,
  danoCharm,
  danoCurse,
  danoHex,
  danoJinx,
  danoSpell,
  danoTransfiguracao,
  danoContraFeitico,
  danoCura,
} = require('../constants');

const router = express.Router();

router.get('/spells', async (req, res) => {
  try {
    const dados = await buscarFeiticos();
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

        feiticos.push({
          id: feitico.id,
          name: atributos.name,
          effect: atributos.effect || 'Efeito desconhecido',
          category: atributos.category || 'Spell',
          light: atributos.light || 'Unknown',
          damage: dano,
        });
      }
    }

    res.json({ spells: embaralhar(feiticos).slice(0, totalFeiticos) });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).json({ error: 'erro ao buscar feiticos' });
  }
});

module.exports = router;
