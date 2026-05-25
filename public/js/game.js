const state = {
  phase: 'loading',
  pack: [],
  selectedCards: [],
  playerDeck: [],
  cpuDeck: [],
  spells: [],
  playerSpells: [],
  round: 1,
  scoreP: 0,
  scoreC: 0,
  waiting: false,
};

function log(mensagem, tipo) {
  const tipoFinal = tipo || 'info';
  const elemento = document.getElementById('battleLog');
  const span = document.createElement('span');
  span.className = `log-entry ${tipoFinal}`;
  span.textContent = mensagem;
  elemento.appendChild(span);
  elemento.scrollTop = elemento.scrollHeight;
}

function setStatus(mensagem) {
  document.getElementById('battleStatus').textContent = mensagem;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function (tela) { tela.classList.remove('active'); });
  const elemento = document.getElementById(id);
  if (elemento) elemento.classList.add('active');
}

function getActiveIdx(deck) {
  for (let i = 0; i < deck.length; i += 1) {
    if (deck[i].hp > 0) return i;
  }
  return -1;
}

function embaralharFeiticos(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copia[i];
    copia[i] = copia[j];
    copia[j] = temp;
  }
  return copia;
}

async function loadGame() {
  const barra = document.getElementById('loadBar');
  const mensagem = document.getElementById('loadMsg');

  mensagem.textContent = 'Invocando personagens...';
  barra.style.width = '20%';
  state.pack = await fetchPack();

  barra.style.width = '55%';
  mensagem.textContent = 'Consultando o livro de feitiços...';
  state.spells = await fetchSpells();

  barra.style.width = '85%';
  mensagem.textContent = 'Preparando o adversário...';
  state.cpuDeck = await fetchCpuDeck();

  state.playerSpells = embaralharFeiticos(state.spells).slice(0, 5);

  barra.style.width = '100%';
  mensagem.textContent = 'Pronto!';

  setTimeout(function () {
    document.getElementById('screen-loading').classList.add('fade-out');
    setTimeout(function () {
      document.getElementById('screen-loading').style.display = 'none';
      showScreen('screen-draft');
      renderPack();
    }, 600);
  }, 400);
}

function toggleDraftCard(indice) {
  const posicao = state.selectedCards.indexOf(indice);
  if (posicao >= 0) {
    state.selectedCards.splice(posicao, 1);
  } else {
    if (state.selectedCards.length >= 2) return;
    state.selectedCards.push(indice);
  }
  renderPack();
}

async function rerollPack() {
  state.selectedCards = [];
  document.getElementById('packGrid').innerHTML = '<div style="text-align:center;padding:40px;font-family:Cinzel,serif;font-size:0.7rem;letter-spacing:2px;color:var(--parchment-dark);grid-column:1/-1">Invocando novos bruxos...</div>';
  state.pack = await fetchPack();
  renderPack();
}

function confirmDraft() {
  if (state.selectedCards.length < 2) return;
  state.playerDeck = [state.pack[state.selectedCards[0]], state.pack[state.selectedCards[1]]];
  startBattle();
}

function startBattle() {
  state.round = 1;
  state.scoreP = 0;
  state.scoreC = 0;
  state.waiting = false;

  document.getElementById('scoreP').textContent = '0';
  document.getElementById('scoreC').textContent = '0';
  document.getElementById('roundNum').textContent = '1';
  document.getElementById('battleLog').innerHTML = '';
  document.getElementById('btnNext').style.display = 'none';

  showScreen('screen-battle');
  renderBattleState();
  log('⚔ O duelo começou! Escolha um feitiço para atacar.', 'info');
  setStatus('Escolha um feitiço para atacar!');
}

function renderBattleState() {
  const indiceJogador = getActiveIdx(state.playerDeck);
  const indiceCpu = getActiveIdx(state.cpuDeck);

  if (indiceJogador < 0 || indiceCpu < 0) { endGame(); return; }

  const personagemJogador = state.playerDeck[indiceJogador];
  const personagemCpu = state.cpuDeck[indiceCpu];

  document.getElementById('playerActiveName').textContent = personagemJogador.name;
  document.getElementById('cpuActiveName').textContent = personagemCpu.name;

  const slotJogador = document.getElementById('playerCardSlot');
  const slotCpu = document.getElementById('cpuCardSlot');

  const divJogador = document.createElement('div');
  divJogador.className = 'card battle-card';
  divJogador.id = 'battleCardP';
  divJogador.innerHTML = renderCard(personagemJogador);
  slotJogador.innerHTML = '';
  slotJogador.appendChild(divJogador);

  const divCpu = document.createElement('div');
  divCpu.className = 'card battle-card';
  divCpu.id = 'battleCardC';
  divCpu.innerHTML = renderCard(personagemCpu);
  slotCpu.innerHTML = '';
  slotCpu.appendChild(divCpu);

  renderDeckBadges(state.playerDeck, indiceJogador, 'playerDeckBadges');
  renderDeckBadges(state.cpuDeck, indiceCpu, 'cpuDeckBadges');
  renderSpells(!state.waiting);
}

function castSpell(indiceFeitico) {
  if (state.waiting) return;
  state.waiting = true;
  renderSpells(false);

  const feitico = state.playerSpells[indiceFeitico];
  const indiceJogador = getActiveIdx(state.playerDeck);
  const indiceCpu = getActiveIdx(state.cpuDeck);
  const personagemJogador = state.playerDeck[indiceJogador];
  const personagemCpu = state.cpuDeck[indiceCpu];

  const danoBruto = Math.floor(feitico.damage * (personagemJogador.magic / 100) * (Math.random() * 0.4 + 0.8));

  if (feitico.damage < 0) {
    const cura = Math.abs(danoBruto);
    personagemJogador.hp = Math.min(personagemJogador.maxHp, personagemJogador.hp + cura);
    log(`✨ ${feitico.name} — você curou ${cura} HP! (${personagemJogador.name}: ${personagemJogador.hp} HP)`, 'heal');
    document.getElementById('battleCardP').classList.add('battling');
    setTimeout(function () {
      const carta = document.getElementById('battleCardP');
      if (carta) carta.classList.remove('battling');
    }, 500);
  } else {
    personagemCpu.hp -= danoBruto;
    log(`⚡ ${feitico.name} → ${personagemCpu.name} perdeu ${danoBruto} HP! (${personagemCpu.name}: ${Math.max(0, personagemCpu.hp)} HP)`, 'win');
    document.getElementById('battleCardC').classList.add('hit');
    setTimeout(function () {
      const carta = document.getElementById('battleCardC');
      if (carta) carta.classList.remove('hit');
    }, 600);
  }

  setTimeout(function () {
    const indiceFeiticoCpu = Math.floor(Math.random() * state.spells.length);
    const feiticoCpu = state.spells[indiceFeiticoCpu];
    const danoCpu = Math.floor(feiticoCpu.damage * (personagemCpu.magic / 100) * (Math.random() * 0.4 + 0.8));

    if (feiticoCpu.damage < 0) {
      const curaCpu = Math.abs(danoCpu);
      personagemCpu.hp = Math.min(personagemCpu.maxHp, personagemCpu.hp + curaCpu);
      log(`🧙 CPU: ${feiticoCpu.name} — CPU curou ${curaCpu} HP! (${personagemCpu.name}: ${personagemCpu.hp} HP)`, 'heal');
      const cartaCpu = document.getElementById('battleCardC');
      if (cartaCpu) cartaCpu.classList.add('battling');
      setTimeout(function () {
        const carta = document.getElementById('battleCardC');
        if (carta) carta.classList.remove('battling');
      }, 500);
    } else {
      personagemJogador.hp -= danoCpu;
      log(`💀 CPU: ${feiticoCpu.name} → ${personagemJogador.name} perdeu ${danoCpu} HP! (${personagemJogador.name}: ${Math.max(0, personagemJogador.hp)} HP)`, 'lose');
      const cartaJogador = document.getElementById('battleCardP');
      if (cartaJogador) cartaJogador.classList.add('hit');
      setTimeout(function () {
        const carta = document.getElementById('battleCardP');
        if (carta) carta.classList.remove('hit');
      }, 600);
    }

    setTimeout(function () {
      let rodadaTerminou = false;

      if (indiceJogador >= 0 && state.playerDeck[indiceJogador].hp <= 0) {
        log(`💀 ${state.playerDeck[indiceJogador].name} foi derrotado!`, 'lose');
        state.scoreC += 1;
        document.getElementById('scoreC').textContent = state.scoreC;
        rodadaTerminou = true;
      }
      if (indiceCpu >= 0 && state.cpuDeck[indiceCpu].hp <= 0) {
        log(`🏆 ${state.cpuDeck[indiceCpu].name} foi derrotado!`, 'win');
        state.scoreP += 1;
        document.getElementById('scoreP').textContent = state.scoreP;
        rodadaTerminou = true;
      }

      renderBattleState();

      const jogadorVivo = getActiveIdx(state.playerDeck);
      const cpuVivo = getActiveIdx(state.cpuDeck);

      if (jogadorVivo < 0 || cpuVivo < 0) {
        setTimeout(endGame, 800);
        return;
      }

      state.waiting = false;

      if (rodadaTerminou) {
        state.round += 1;
        document.getElementById('roundNum').textContent = state.round;
        log(`— Rodada ${state.round} —`, 'info');
      }

      setStatus('Escolha um feitiço para atacar!');
      renderSpells(true);
    }, 700);
  }, 800);
}

function nextRound() {
  document.getElementById('btnNext').style.display = 'none';
  state.round += 1;
  document.getElementById('roundNum').textContent = state.round;
  log(`— Rodada ${state.round} —`, 'info');
  state.waiting = false;
  renderBattleState();
  setStatus('Escolha um feitiço para atacar!');
}

function endGame() {
  const over = document.getElementById('screen-over');
  const glyph = document.getElementById('overGlyph');
  const titulo = document.getElementById('overTitle');
  const subtitulo = document.getElementById('overSub');
  const pontuacao = document.getElementById('overScore');

  if (state.scoreP > state.scoreC) {
    glyph.textContent = '🏆';
    titulo.textContent = 'Vitória!';
    subtitulo.textContent = 'Você dominou o duelo!';
  } else if (state.scoreC > state.scoreP) {
    glyph.textContent = '💀';
    titulo.textContent = 'Derrota';
    subtitulo.textContent = 'O CPU foi mais poderoso desta vez.';
  } else {
    glyph.textContent = '✦';
    titulo.textContent = 'Empate';
    subtitulo.textContent = 'Bruxos igualmente poderosos.';
  }
  pontuacao.textContent = `Você ${state.scoreP}  ×  ${state.scoreC} CPU`;
  over.classList.add('active');
}

function restartGame() {
  document.getElementById('screen-over').classList.remove('active');
  state.selectedCards = [];
  state.pack = [];
  state.playerDeck = [];

  const telaLoading = document.getElementById('screen-loading');
  telaLoading.style.display = 'flex';
  telaLoading.classList.remove('fade-out');
  document.getElementById('loadBar').style.width = '0%';
  showScreen('');
  loadGame();
}

loadGame();
