function getHouseColor(casa) {
  if (casa === 'Gryffindor') return '#6b1010';
  if (casa === 'Slytherin') return '#0a3018';
  if (casa === 'Hufflepuff') return '#3a2800';
  if (casa === 'Ravenclaw') return '#0a1a3a';
  return '#1e1040';
}

function getHouseEmoji(casa) {
  if (casa === 'Gryffindor') return '🦁';
  if (casa === 'Slytherin') return '🐍';
  if (casa === 'Hufflepuff') return '🦡';
  if (casa === 'Ravenclaw') return '🦅';
  return '✦';
}

function hpColor(porcentagem) {
  if (porcentagem > 0.6) return 'linear-gradient(90deg,#0a4a2a,#22cc77)';
  if (porcentagem > 0.3) return 'linear-gradient(90deg,#4a3a00,#ccaa22)';
  return 'linear-gradient(90deg,#4a0a0a,#cc2222)';
}

function renderCard(personagem) {
  const porcentagemHp = personagem.hp / personagem.maxHp;
  const corCasa = getHouseColor(personagem.house);
  const emojiCasa = getHouseEmoji(personagem.house);
  const imagemFallback = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png';

  return `
    <div class="card-img">
      <img src="${personagem.image}" alt="${personagem.name}" onerror="this.src='${imagemFallback}'">
      <div class="house-badge" style="background:${corCasa}">${emojiCasa}</div>
    </div>
    <div class="card-body">
      <div class="card-name">${personagem.name}</div>
      <div class="card-meta">${personagem.species} · ${personagem.house}</div>
      <div class="hp-bar-wrap">
        <span class="hp-label">HP</span>
        <div class="hp-track">
          <div class="hp-fill" style="width:${Math.max(0, porcentagemHp * 100)}%;background:${hpColor(porcentagemHp)}"></div>
        </div>
        <span class="hp-val">${Math.max(0, personagem.hp)}/${personagem.maxHp}</span>
      </div>
      <div class="mini-stats">
        <div class="mini-stat"><span class="mini-stat-icon">⚡</span><span class="mini-stat-val">${personagem.power}</span><span class="mini-stat-lbl">Poder</span></div>
        <div class="mini-stat"><span class="mini-stat-icon">🔮</span><span class="mini-stat-val">${personagem.magic}</span><span class="mini-stat-lbl">Magia</span></div>
        <div class="mini-stat"><span class="mini-stat-icon">🛡</span><span class="mini-stat-val">${personagem.defense}</span><span class="mini-stat-lbl">Defesa</span></div>
      </div>
    </div>
  `;
}

function renderDeckBadges(deck, indiceAtivo, elementoId) {
  const elemento = document.getElementById(elementoId);
  const imagemFallback = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png';
  let html = '';
  for (let i = 0; i < deck.length; i += 1) {
    const classe = deck[i].hp <= 0 ? 'deck-thumb dead' : (i === indiceAtivo ? 'deck-thumb active' : 'deck-thumb');
    html += `<div class="${classe}"><img src="${deck[i].image}" onerror="this.src='${imagemFallback}'"></div>`;
  }
  elemento.innerHTML = html;
}

function renderSpells(habilitado) {
  const elemento = document.getElementById('spellList');
  let html = '';
  for (let i = 0; i < state.playerSpells.length; i += 1) {
    const feitico = state.playerSpells[i];
    const ehCura = feitico.damage < 0;
    const labelDano = ehCura ? `💚 +${Math.abs(feitico.damage)} HP` : `💀 ${feitico.damage} dmg`;
    const classeDano = ehCura ? 'spell-dmg heal' : 'spell-dmg attack';
    const desabilitado = habilitado ? '' : 'disabled';
    html += `
      <button class="spell-btn" ${desabilitado} onclick="castSpell(${i})">
        <div>
          <span class="spell-name">${feitico.name}</span>
          <span class="spell-effect">${feitico.effect}</span>
        </div>
        <span class="${classeDano}">${labelDano}</span>
      </button>
    `;
  }
  elemento.innerHTML = html;
}

function renderPack() {
  const grid = document.getElementById('packGrid');
  grid.innerHTML = '';
  for (let i = 0; i < state.pack.length; i += 1) {
    const personagem = state.pack[i];
    const estaSelecionado = state.selectedCards.indexOf(i) >= 0;
    const div = document.createElement('div');
    div.className = `card${estaSelecionado ? ' selected' : ''}`;
    div.innerHTML = renderCard(personagem);
    div.setAttribute('data-idx', i);
    div.onclick = (function capturaIndice(indice) { return function () { toggleDraftCard(indice); }; }(i));
    grid.appendChild(div);
  }
  document.getElementById('draftCount').textContent = state.selectedCards.length;
  document.getElementById('btnConfirmDraft').disabled = state.selectedCards.length < 2;
}
