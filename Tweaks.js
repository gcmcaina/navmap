// ==UserScript==
// @name         Tweaks v8.5
// @namespace    http://tampermonkey.net/
// @version      8.5
// @description  Correção definitiva da renderização lateral, RF Clicável e Menus
// @author       Gemini Partner
// @match        https://smartsampa.sentinelx.com.br/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    let usersData = [];
    let removeBlurEnabled = true;

    // --- 1. CARREGAMENTO DO BANCO DE DADOS ---
    const loadUsers = async () => {
        try {
            const response = await fetch("https://pasxdfee4hmmik2o.public.blob.vercel-storage.com/json/users.json");
            usersData = await response.json();
        } catch (err) { console.error("Erro banco", err); }
    };
    loadUsers();

    // --- 2. ESTILOS ---
    GM_addStyle(`
        #tweaks-panel {
            position: fixed; right: 20px; top: 60px; width: 280px;
            background: #121212; border: 1px solid #333; border-radius: 12px;
            padding: 0; z-index: 9999; display: none; color: white;
            box-shadow: 0 8px 32px rgba(0,0,0,0.8); font-family: sans-serif;
            overflow: hidden;
        }
        .panel-header-search { padding: 15px; background: #1a1a1a; border-bottom: 1px solid #333; }
        .search-input { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 10px; border-radius: 6px; outline: none; box-sizing: border-box; font-size: 13px; }
        .menu-category { border-bottom: 1px solid #222; }
        .menu-header { padding: 10px 15px; background: #1a1a1a; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: bold; color: #888; text-transform: uppercase; }
        .submenu-content { padding: 10px 15px; background: #121212; display: none; }
        .submenu-content.active { display: block; }
        .tweak-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 13px; }

        /* Estilo RF Clicável */
        .rf-clickable { color: #3498db !important; text-decoration: underline !important; cursor: pointer !important; font-weight: bold !important; }
        .rf-clickable:hover { color: #2980b9 !important; background-color: rgba(52, 152, 219, 0.1); }
    `);

    // --- 3. LÓGICA RF CLICÁVEL ---
    const makeRFClickable = () => {
        const rfCells = document.querySelectorAll('[data-column-id="1"] div[data-tag="allowRowEvents"]');
        rfCells.forEach(cell => {
            if (cell.classList.contains('rf-processed')) return;
            const rfValue = cell.innerText.trim();
            if (/^\d+$/.test(rfValue)) {
                const user = usersData.find(u => String(u.registry) === rfValue);
                if (user) {
                    cell.classList.add('rf-clickable', 'rf-processed');
                    cell.onclick = (e) => {
                        e.stopPropagation();
                        window.open(`https://smartsampa.sentinelx.com.br/access/users/form/${user.id}`, '_blank');
                    };
                }
            }
        });
    };

    // --- 4. INJEÇÃO CORRIGIDA DA SIDEBAR (LÓGICA ANTI-ERRO) ---
    const injectMenuButton = () => {
        const sidebarContainer = document.querySelector('.css-175oi2r[style*="gap: 5px"]');
        if (!sidebarContainer) return;

        // Detecta o estado baseado na largura real do elemento pai (250px ou 64px)
        const sidebarParent = sidebarContainer.closest('.r-bnwqim');
        if (!sidebarParent) return;
        const isCollapsed = sidebarParent.offsetWidth < 100;

        const existingBtn = document.getElementById('tweak-menu-btn');

        // Se o botão já existe, verificamos se ele precisa mudar de "modo" (com texto ou sem texto)
        if (existingBtn) {
            const currentlyHasText = !!existingBtn.querySelector('.tweak-text');
            if ((isCollapsed && currentlyHasText) || (!isCollapsed && !currentlyHasText)) {
                existingBtn.remove(); // Se o modo estiver errado, deletamos para recriar
            } else {
                return; // Se estiver certo, não fazemos nada
            }
        }

        const btn = document.createElement('div');
        btn.id = 'tweak-menu-btn';
        btn.className = 'css-175oi2r r-1loqt21 r-1otgn73';
        btn.style.width = '100%';
        btn.style.cursor = 'pointer';

        // Construção Condicional do HTML:
        if (isCollapsed) {
            // MODO COMPACTO: Apenas o SVG centralizado. SEM DIV DE TEXTO.
            btn.innerHTML = `
                <div class="css-175oi2r" style="flex-direction: row; align-items: center; justify-content: center; height: 40px; border-radius: 10px;">
                    <svg viewBox="0 0 512 512" width="16" color="#FFFFFF" fill="currentColor">
                        <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-75.6 68.1c.7 5.4 1.1 10.9 1.1 16.5s-.4 11.1-1.1 16.5l75.6 68.1c6.9 6.2 9.6 15.9 6.4 24.6l-44.3 119.7c-3.2 8.7-11.4 14.1-20.1 14.1s-16.9-5.4-20.1-14.1l-75.6-68.1c-5.4 .7-10.9 1.1-16.5 1.1s-11.1-.4-16.5-1.1l-75.6 68.1c-3.2 8.7-11.4 14.1-20.1 14.1s-16.9-5.4-20.1-14.1L16.1 345.2c-3.2-8.7-.5-18.4 6.4-24.6l75.6-68.1c-.7-5.4-1.1-10.9-1.1-16.5s.4-11.1 1.1-16.5L22.5 151.4c-6.9-6.2-9.6-15.9-6.4-24.6L60.4 7.1c3.2-8.7 11.4-14.1 20.1-14.1s16.9 5.4 20.1 14.1l75.6 68.1c5.4-.7 10.9-1.1 16.5-1.1s11.1 .4 16.5 1.1l75.6-68.1c3.2-8.7 11.4-14.1 20.1-14.1s16.9 5.4 20.1 14.1l44.3 119.7zM256 320a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"/>
                    </svg>
                </div>`;
        } else {
            // MODO EXPANDIDO: Ícone + Texto lateral
            btn.innerHTML = `
                <div class="css-175oi2r" style="flex-direction: row; align-items: center; column-gap: 10px; height: 40px; border-radius: 10px; padding-left: 15px;">
                    <svg viewBox="0 0 512 512" width="16" color="#FFFFFF" fill="currentColor">
                        <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-75.6 68.1c.7 5.4 1.1 10.9 1.1 16.5s-.4 11.1-1.1 16.5l75.6 68.1c6.9 6.2 9.6 15.9 6.4 24.6l-44.3 119.7c-3.2 8.7-11.4 14.1-20.1 14.1s-16.9-5.4-20.1-14.1l-75.6-68.1c-5.4 .7-10.9 1.1-16.5 1.1s-11.1-.4-16.5-1.1l-75.6 68.1c-3.2 8.7-11.4 14.1-20.1 14.1s-16.9-5.4-20.1-14.1L16.1 345.2c-3.2-8.7-.5-18.4 6.4-24.6l75.6-68.1c-.7-5.4-1.1-10.9-1.1-16.5s.4-11.1 1.1-16.5L22.5 151.4c-6.9-6.2-9.6-15.9-6.4-24.6L60.4 7.1c3.2-8.7 11.4-14.1 20.1-14.1s16.9 5.4 20.1 14.1l75.6 68.1c5.4-.7 10.9-1.1 16.5-1.1s11.1 .4 16.5 1.1l75.6-68.1c3.2-8.7 11.4-14.1 20.1-14.1s16.9 5.4 20.1 14.1l44.3 119.7zM256 320a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"/>
                    </svg>
                    <div class="tweak-text css-146c3p1" style="color:white; font-size:16px; font-weight:600;">Tweaks</div>
                </div>`;
        }

        btn.onclick = (e) => {
            e.stopPropagation();
            const p = document.getElementById('tweaks-panel');
            p.style.display = (p.style.display === 'block') ? 'none' : 'block';
        };
        sidebarContainer.appendChild(btn);
    };

    // --- 5. CRIAÇÃO DO PAINEL ---
    const createPanel = () => {
        if (document.getElementById('tweaks-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'tweaks-panel';
        panel.innerHTML = `
            <div class="panel-header-search"><input type="text" id="tweak-search" class="search-input" placeholder="Buscar Usuário"></div>
            <div class="menu-category">
                <div class="menu-header" onclick="this.nextElementSibling.classList.toggle('active')">GERAL <span>▾</span></div>
                <div class="submenu-content">
                    <div class="tweak-row"><span>Remover Blur</span><input type="checkbox" id="chk-blur" checked></div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        document.getElementById('tweak-search').onkeypress = (e) => {
            if(e.key === 'Enter') {
                const val = e.target.value.trim();
                if (!/^\d+$/.test(val)) window.open(`https://smartsampa.sentinelx.com.br/access/users?page=1&textFilter=${encodeURIComponent(val)}`, '_blank');
                else {
                    const user = usersData.find(u => String(u.registry) === val);
                    window.open(`https://smartsampa.sentinelx.com.br/access/users/form/${user ? user.id : val}`, '_blank');
                }
                e.target.value = '';
            }
        };
        document.getElementById('chk-blur').onchange = (e) => removeBlurEnabled = e.target.checked;
    };

    // --- 6. MONITORAMENTO ---
    const mainObserver = new MutationObserver(() => {
        if (removeBlurEnabled) document.querySelectorAll('[style*="filter: blur"]').forEach(e => e.style.filter = 'none');
        injectMenuButton();
        makeRFClickable();
    });
    mainObserver.observe(document.body, { childList: true, subtree: true });
    createPanel();

})();
