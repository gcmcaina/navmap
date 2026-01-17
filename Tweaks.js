// ==UserScript==
// @name         Tweaks
// @namespace    http://tampermonkey.net/
// @version      8.0
// @description  Correção Lateral, 16:9, Busca Inteligente e Área de Vídeo Ampliada
// @author       teste
// @match        smartsampa.sentinelx.com.br/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    let usersData = [];
    let removeBlurEnabled = true;
    let compactActionsEnabled = false;
    let force169Enabled = true;

    // --- 1. CARREGAMENTO DO BANCO DE DADOS ---
    const loadUsers = async () => {
        try {
            const response = await fetch("https://pasxdfee4hmmik2o.public.blob.vercel-storage.com/json/users.json");
            usersData = await response.json();
        } catch (err) { console.error("Erro banco", err); }
    };
    loadUsers();

    // --- 2. ESTILOS DO PAINEL E VÍDEO ---
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

        /* AJUSTE DE VÍDEO 16:9 E ÁREA AMPLIADA */
        .video-fixed-169 {
            object-fit: contain !important;
            aspect-ratio: 16 / 9 !important;
            width: 100% !important;
            height: auto !important;
            background-color: #000 !important;
        }
        /* Remove padding excessivo da área do container do vídeo */
        .video-area-expanded {
            padding: 0 !important;
            margin: 0 !important;
            max-height: none !important;
        }
    `);

    // --- 3. LÓGICA DE VÍDEO ---
    const adjustVideoSettings = () => {
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(v => {
            if (force169Enabled) v.classList.add('video-fixed-169');
            else v.classList.remove('video-fixed-169');
        });

        // Ampliar a área do container (conforme solicitado)
        const videoContainer = document.querySelector('.css-175oi2r[style*="height: 847px"]');
        if (videoContainer) videoContainer.classList.add('video-area-expanded');
    };

    // --- 4. INJEÇÃO DO BOTÃO SIDEBAR (CORREÇÃO DE RENDERIZAÇÃO) ---
    const injectMenuButton = () => {
        const sidebarList = document.querySelector('.css-175oi2r[style*="gap: 5px"]');
        if (!sidebarList) return;

        // Medição real para saber se está compactado (64px) ou expandido (250px)
        const sidebarParent = sidebarList.closest('.r-1awozwy');
        const isCollapsed = sidebarParent && sidebarParent.offsetWidth < 100;

        const existingBtn = document.getElementById('tweak-menu-btn');
        if (existingBtn) {
            const hasTextNode = !!existingBtn.querySelector('.tweak-text');
            // Se o estado visual não condiz com a largura, removemos para reconstruir
            if ((isCollapsed && hasTextNode) || (!isCollapsed && !hasTextNode)) {
                existingBtn.remove();
            } else { return; }
        }

        const btn = document.createElement('div');
        btn.id = 'tweak-menu-btn';
        btn.className = 'css-175oi2r r-1loqt21 r-1otgn73';
        btn.style.width = '100%';
        btn.style.cursor = 'pointer';

        const innerContainer = document.createElement('div');
        innerContainer.className = 'css-175oi2r';

        // Estilização baseada no estado real detectado
        if (isCollapsed) {
            innerContainer.setAttribute('style', 'display: flex; flex-direction: row; align-items: center; justify-content: center; height: 40px; border-radius: 10px;');
            innerContainer.innerHTML = `<svg viewBox="0 0 512 512" width="16" color="#FFFFFF" fill="currentColor"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-75.6 68.1c.7 5.4 1.1 10.9 1.1 16.5s-.4 11.1-1.1 16.5l75.6 68.1c6.9 6.2 9.6 15.9 6.4 24.6l-44.3 119.7c-3.2 8.7-11.4 14.1-20.1 14.1s-16.9-5.4-20.1-14.1l-75.6-68.1c-5.4 .7-10.9 1.1-16.5 1.1s-11.1-.4-16.5-1.1l-75.6 68.1c-3.2 8.7-11.4 14.1-20.1 14.1s-16.9-5.4-20.1-14.1L16.1 345.2c-3.2-8.7-.5-18.4 6.4-24.6l75.6-68.1c-.7-5.4-1.1-10.9-1.1-16.5s.4-11.1 1.1-16.5L22.5 151.4c-6.9-6.2-9.6-15.9-6.4-24.6L60.4 7.1c3.2-8.7 11.4-14.1 20.1-14.1s16.9 5.4 20.1 14.1l75.6 68.1c5.4-.7 10.9-1.1 16.5-1.1s11.1 .4 16.5 1.1l75.6-68.1c3.2-8.7 11.4-14.1 20.1-14.1s16.9 5.4 20.1 14.1l44.3 119.7zM256 320a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"/></svg>`;
        } else {
            innerContainer.setAttribute('style', 'display: flex; flex-direction: row; align-items: center; column-gap: 10px; height: 40px; border-radius: 10px; padding-left: 15px;');
            innerContainer.innerHTML = `
                <svg viewBox="0 0 512 512" width="16" color="#FFFFFF" fill="currentColor"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-75.6 68.1c.7 5.4 1.1 10.9 1.1 16.5s-.4 11.1-1.1 16.5l75.6 68.1c6.9 6.2 9.6 15.9 6.4 24.6l-44.3 119.7c-3.2 8.7-11.4 14.1-20.1 14.1s-16.9-5.4-20.1-14.1l-75.6-68.1c-5.4 .7-10.9 1.1-16.5 1.1s-11.1-.4-16.5-1.1l-75.6 68.1c-3.2 8.7-11.4 14.1-20.1 14.1s-16.9-5.4-20.1-14.1L16.1 345.2c-3.2-8.7-.5-18.4 6.4-24.6l75.6-68.1c-.7-5.4-1.1-10.9-1.1-16.5s.4-11.1 1.1-16.5L22.5 151.4c-6.9-6.2-9.6-15.9-6.4-24.6L60.4 7.1c3.2-8.7 11.4-14.1 20.1-14.1s16.9 5.4 20.1 14.1l75.6 68.1c5.4-.7 10.9-1.1 16.5-1.1s11.1 .4 16.5 1.1l75.6-68.1c3.2-8.7 11.4-14.1 20.1-14.1s16.9 5.4 20.1 14.1l44.3 119.7zM256 320a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"/></svg>
                <div class="tweak-text css-146c3p1" style="color:white; font-size:16px; font-weight:600;">Tweaks</div>
            `;
        }

        btn.appendChild(innerContainer);
        btn.onclick = (e) => {
            e.stopPropagation();
            const p = document.getElementById('tweaks-panel');
            p.style.display = (p.style.display === 'block') ? 'none' : 'block';
        };
        sidebarList.appendChild(btn);
    };

    // --- 5. COMPACTADOR DE BOTÕES GERAIS ---
    const applyCompactActions = () => {
        const actionContainer = document.querySelector('.css-175oi2r[style*="column-gap: 20px"]');
        if (actionContainer && compactActionsEnabled) {
            if (document.getElementById('tweak-gear-btn')) return;
            actionContainer.style.display = 'none';
            const gearWrapper = document.createElement('div');
            gearWrapper.id = 'tweak-gear-container';
            gearWrapper.innerHTML = `<div id="tweak-gear-btn" style="background:#fff; border-radius:5px; width:40px; height:40px; display:flex; align-items:center; justify-content:center; cursor:pointer; border:1px solid #ddd;">
                <svg width="20" height="20" viewBox="0 0 512 512" fill="#181A1B"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-75.6 68.1c.7 5.4 1.1 10.9 1.1 16.5s-.4 11.1-1.1 16.5l75.6 68.1c6.9 6.2 9.6 15.9 6.4 24.6l-44.3 119.7c-3.2 8.7-11.4 14.1-20.1 14.1s-16.9-5.4-20.1-14.1l-75.6-68.1c-5.4 .7-10.9 1.1-16.5 1.1s-11.1-.4-16.5-1.1l-75.6 68.1c-3.2 8.7-11.4 14.1-20.1 14.1s-16.9-5.4-20.1-14.1L16.1 345.2c-3.2-8.7-.5-18.4 6.4-24.6l75.6-68.1c-.7-5.4-1.1-10.9-1.1-16.5s.4-11.1 1.1-16.5L22.5 151.4c-6.9-6.2-9.6-15.9-6.4-24.6L60.4 7.1c3.2-8.7 11.4-14.1 20.1-14.1s16.9 5.4 20.1 14.1l75.6 68.1c5.4-.7 10.9-1.1 16.5-1.1s11.1 .4 16.5 1.1l75.6-68.1c3.2-8.7 11.4-14.1 20.1-14.1s16.9 5.4 20.1 14.1l44.3 119.7zM256 320a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"/></svg>
            </div><div id="compact-dropdown" style="display:none; position:absolute; top:45px; right:0; background:#fff; padding:10px; border-radius:8px; box-shadow:0 4px 15px rgba(0,0,0,0.3); z-index:1000; flex-direction:row; gap:10px; border:1px solid #ddd;"></div>`;
            actionContainer.parentNode.insertBefore(gearWrapper, actionContainer);
            const gearBtn = document.getElementById('tweak-gear-btn');
            const dropdown = document.getElementById('compact-dropdown');
            gearBtn.onclick = (e) => { e.stopPropagation(); if(dropdown.style.display==='none'){ dropdown.appendChild(actionContainer); actionContainer.style.display='flex'; dropdown.style.display='flex'; } else { dropdown.style.display='none'; }};
        } else if (actionContainer && !compactActionsEnabled) {
            const gear = document.getElementById('tweak-gear-container');
            if (gear) { actionContainer.style.display = 'flex'; gear.parentNode.insertBefore(actionContainer, gear); gear.remove(); }
        }
    };

    // --- 6. INTERFACE DO PAINEL ---
    const createPanel = () => {
        if (document.getElementById('tweaks-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'tweaks-panel';
        panel.innerHTML = `
            <div class="panel-header-search">
                <input type="text" id="tweak-search" class="search-input" placeholder="Buscar Nome, RF ou ID...">
                <span id="search-status" style="font-size:11px; color:#888; display:block; text-align:center; margin-top:5px;"></span>
            </div>
            <div class="menu-category">
                <div class="menu-header" onclick="this.nextElementSibling.classList.toggle('active')">GERAL <span>▾</span></div>
                <div class="submenu-content active">
                    <div class="tweak-row"><span>Remover Blur</span><input type="checkbox" id="chk-blur" checked></div>
                    <div class="tweak-row"><span>Forçar 16:9</span><input type="checkbox" id="chk-169" checked></div>
                    <div style="font-size: 10px; color: #555; margin: 10px 0 5px; font-weight: bold; border-top: 1px solid #333; padding-top: 5px;">IMPLEMENTAÇÕES DIVERSAS</div>
                    <div class="tweak-row"><span>Compactar Ações</span><input type="checkbox" id="chk-compact"></div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        document.getElementById('chk-blur').onchange = (e) => removeBlurEnabled = e.target.checked;
        document.getElementById('chk-169').onchange = (e) => { force169Enabled = e.target.checked; adjustVideoSettings(); };
        document.getElementById('chk-compact').onchange = (e) => { compactActionsEnabled = e.target.checked; applyCompactActions(); };
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
    };

    // --- 7. MONITORAMENTO ---
    const mainObserver = new MutationObserver(() => {
        if (removeBlurEnabled) document.querySelectorAll('[style*="filter: blur"]').forEach(e => e.style.filter = 'none');
        adjustVideoSettings();
        injectMenuButton();
        applyCompactActions();
    });
    mainObserver.observe(document.body, { childList: true, subtree: true });
    createPanel();

})();
