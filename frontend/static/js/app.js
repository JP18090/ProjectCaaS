const itemInput = document.getElementById('item-input');
const addBtn = document.getElementById('add-btn');
const addForm = document.getElementById('add-form');
const itemsList = document.getElementById('items-list');
const emptyMsg = document.getElementById('empty-msg');
const API_BASE_URL = 'http://172.31.130.202:25000';

// Helper to prepend base URL
function apiUrl(path) {
    return API_BASE_URL + path;
}

// Wrapper around fetch to automatically use base URL
function apiFetch(path, options) {
    return fetch(apiUrl(path), options);
}

function buildLogDetails(operation, extras) {
    return Object.assign(
        {
            operation: operation,
            timestamp: new Date().toISOString(),
        },
        extras || {}
    );
}

function logHttpFailure(operation, response) {
    console.error('[API] Falha HTTP', buildLogDetails(operation, {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
    }));
}

function logOperationError(operation, error) {
    console.error('[APP] Erro na operação', buildLogDetails(operation, {
        message: error && error.message ? error.message : String(error),
        stack: error && error.stack ? error.stack : null,
    }));
}

function ensureOkOrThrow(response, message, operation) {
    if (!response.ok) {
        logHttpFailure(operation, response);
        throw new Error(message + ' (HTTP ' + response.status + ').');
    }
    return response;
}

function showFriendlyError(message) {
    window.alert(message);
}

function parseJsonOrThrow(response, message, operation) {
    ensureOkOrThrow(response, message, operation);
    return response.json().catch(function () {
        console.error('[API] Resposta inválida (JSON)', buildLogDetails(operation, {
            status: response.status,
            url: response.url,
        }));
        throw new Error('O servidor retornou um formato inválido.');
    });
}

window.addEventListener('unhandledrejection', function (event) {
    console.error('[APP] Promise não tratada', buildLogDetails('unhandledrejection', {
        reason: event.reason && event.reason.message ? event.reason.message : String(event.reason),
    }));
});

function updateEmptyMessage() {
    emptyMsg.style.display = itemsList.children.length === 0 ? 'block' : 'none';
}

function createItemElement(item) {
    const row = document.createElement('div');
    row.className = 'item' + (item.completed ? ' completo' : '');
    row.dataset.id = item.id;

    const toggle = document.createElement('button');
    toggle.className = 'btn-icon toggle-btn';
    toggle.innerHTML = item.completed ? '&#9745;' : '&#9744;';
    toggle.title = item.completed ? 'Marcar como incompleto' : 'Marcar como concluído';
    
    toggle.addEventListener('click', function () {
        console.info('[API] Enviando requisição', buildLogDetails('atualizar item (PUT /items/:id)', {
            itemId: item.id,
            completed: !item.completed,
        }));
        apiFetch('/items/' + item.id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: item.name, completed: !item.completed }),
        })
            .then(function (r) {
                return parseJsonOrThrow(r, 'Não foi possível atualizar o item', 'atualizar item (PUT /items/:id)');
            })
            .then(function (updated) {
                row.replaceWith(createItemElement(updated));
            })
            .catch(function (err) {
                logOperationError('atualizar item (PUT /items/:id)', err);
                showFriendlyError(err.message);
            });
    });

    const name = document.createElement('span');
    name.className = 'item-name';
    name.textContent = item.name;

    const remove = document.createElement('button');
    remove.className = 'btn-icon remove-btn';
    remove.innerHTML = '&#128465;';
    remove.title = 'Remover Item';
    
    remove.addEventListener('click', function () {
        console.info('[API] Enviando requisição', buildLogDetails('remover item (DELETE /items/:id)', {
            itemId: item.id,
        }));
        apiFetch('/items/' + item.id, { method: 'DELETE' })
            .then(function (r) {
                ensureOkOrThrow(r, 'Não foi possível remover o item', 'remover item (DELETE /items/:id)');
            })
            .then(function () {
                row.remove();
                updateEmptyMessage();
            })
            .catch(function (err) {
                logOperationError('remover item (DELETE /items/:id)', err);
                showFriendlyError(err.message);
            });
    });

    row.appendChild(toggle);
    row.appendChild(name);
    row.appendChild(remove);
    return row;
}

function loadItems() {
    console.info('[API] Enviando requisição', buildLogDetails('carregar itens (GET /items)'));
    apiFetch('/items')
        .then(function (r) {
            return parseJsonOrThrow(r, 'Não foi possível carregar os itens', 'carregar itens (GET /items)');
        })
        .then(function (items) {
            itemsList.innerHTML = '';
            items.forEach(function (item) {
                itemsList.appendChild(createItemElement(item));
            });
            updateEmptyMessage();
        })
        .catch(function (err) {
            logOperationError('carregar itens (GET /items)', err);
            showFriendlyError(err.message);
        });
}

addForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const value = itemInput.value.trim();
    if (!value) return;

    addBtn.disabled = true;
    addBtn.textContent = 'Adicionando...';

    console.info('[API] Enviando requisição', buildLogDetails('adicionar item (POST /items)', {
        nameLength: value.length,
    }));
    apiFetch('/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: value }),
    })
        .then(function (r) {
            return parseJsonOrThrow(r, 'Não foi possível adicionar o item', 'adicionar item (POST /items)');
        })
        .then(function (item) {
            itemsList.appendChild(createItemElement(item));
            itemInput.value = '';
            addBtn.disabled = false;
            addBtn.textContent = 'Adicionar Item';
            updateEmptyMessage();
        })
        .catch(function (err) {
            logOperationError('adicionar item (POST /items)', err);
            showFriendlyError(err.message);
            addBtn.disabled = false;
            addBtn.textContent = 'Adicionar Item';
        });
});

loadItems();
