const people = [];
const $ = (selector) => document.querySelector(selector);
const nameInput = $('#name'), phoneInput = $('#phone'), list = $('#people');

function normalizePhone(value) { return value.replace(/\D/g, ''); }
function escapeHTML(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }
function renderPeople() {
  $('#count').textContent = people.length;
  $('#drawButton').disabled = people.length < 3;
  list.innerHTML = people.map((person, index) => `<li><span class="avatar">${escapeHTML(person.name.slice(0, 2).toUpperCase())}</span><div class="person-info"><strong>${escapeHTML(person.name)}</strong><small>+${escapeHTML(person.phone)}</small></div><button class="remove" data-index="${index}" aria-label="Remover ${escapeHTML(person.name)}">×</button></li>`).join('');
}

$('#personForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = nameInput.value.trim(), phone = normalizePhone(phoneInput.value);
  if (!name || phone.length < 10) { alert('Informe um nome e um WhatsApp válido, com DDD.'); return; }
  if (people.some(p => p.phone === phone)) { alert('Este WhatsApp já foi adicionado.'); return; }
  people.push({ name, phone }); nameInput.value = ''; phoneInput.value = ''; nameInput.focus(); renderPeople();
});
list.addEventListener('click', (event) => { const button = event.target.closest('.remove'); if (button) { people.splice(Number(button.dataset.index), 1); renderPeople(); } });

function shuffledAssignments() {
  const targets = [...people.keys()];
  do { crypto.getRandomValues(new Uint32Array(targets.length)).forEach((value, index) => { const swap = value % targets.length; [targets[index], targets[swap]] = [targets[swap], targets[index]]; }); } while (targets.some((target, index) => target === index));
  return targets;
}
function toBase64(bytes) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function fromBase64(value) { value = value.replace(/-/g, '+').replace(/_/g, '/'); return Uint8Array.from(atob(value + '==='.slice((value.length + 3) % 4)), char => char.charCodeAt(0)); }
async function encryptedLink(result) {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(result))));
  const rawKey = new Uint8Array(await crypto.subtle.exportKey('raw', key));
  return `${location.href.split('#')[0] }#r=${toBase64(encrypted)}.${toBase64(iv)}.${toBase64(rawKey)}`;
}
async function createDraw() {
  const button = $('#drawButton'); button.disabled = true; button.textContent = 'Sorteando…';
  try {
    const targets = shuffledAssignments();
    const shares = await Promise.all(people.map(async (person, index) => ({ ...person, link: await encryptedLink({ friend: people[targets[index]].name }) })));
    $('#drawView').hidden = true; $('#shareView').hidden = false;
    $('#shareList').innerHTML = shares.map(person => {
      const message = `Olá, ${person.name}! ✨ O sorteio do amigo oculto foi realizado. Abra seu resultado secreto: ${person.link}\n\nNão compartilhe este link com ninguém. 🤫`;
      return `<div class="share-row"><span class="avatar">${escapeHTML(person.name.slice(0,2).toUpperCase())}</span><div class="share-info"><strong>${escapeHTML(person.name)}</strong><small>Link único e privado</small><div class="share-actions"><a class="send" target="_blank" rel="noopener" href="https://wa.me/${person.phone}?text=${encodeURIComponent(message)}">WhatsApp ↗</a><button class="copy-link" data-link="${person.link}">Copiar link</button><button class="share-link" data-link="${person.link}" data-name="${escapeHTML(person.name)}">Compartilhar</button></div></div></div>`;
    }).join('');
  } catch (error) {
    alert(error.message || 'Não foi possível concluir o sorteio.'); button.textContent = 'Realizar sorteio →'; button.disabled = people.length < 3;
  }
}
$('#drawButton').addEventListener('click', createDraw);
$('#shareList').addEventListener('click', async (event) => {
  const button = event.target.closest('.copy-link, .share-link'); if (!button) return;
  const link = button.dataset.link;
  if (button.classList.contains('share-link') && navigator.share) {
    try { await navigator.share({ title: 'Seu amigo oculto', text: `Olá, ${button.dataset.name}! Abra seu resultado secreto.`, url: link }); } catch (error) { if (error.name !== 'AbortError') alert('Não foi possível abrir o compartilhamento.'); } return;
  }
  try { await navigator.clipboard.writeText(link); button.textContent = 'Copiado ✓'; setTimeout(() => button.textContent = 'Copiar link', 1800); } catch { prompt('Copie este link:', link); }
});
$('#restart').addEventListener('click', () => { people.length = 0; $('#shareView').hidden = true; $('#drawView').hidden = false; renderPeople(); history.replaceState(null, '', location.href.split('#')[0]); });

async function showPrivateResult() {
  const encoded = new URLSearchParams(location.hash.slice(1)).get('r'); if (!encoded) return;
  try { const [encrypted, iv, rawKey] = encoded.split('.').map(fromBase64); const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['decrypt']); const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted); const result = JSON.parse(new TextDecoder().decode(plain)); $('#app').hidden = true; $('.hero').hidden = true; $('#drawnName').textContent = result.friend; $('#resultDialog').showModal(); history.replaceState(null, '', location.pathname); } catch { alert('Este link de resultado é inválido ou foi alterado.'); }
}
$('#closeResult').addEventListener('click', () => $('#resultDialog').close());
renderPeople(); showPrivateResult();
