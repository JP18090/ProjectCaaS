const itemInput = document.getElementById('item-input');
const addBtn = document.getElementById('add-btn');
const addForm = document.getElementById('add-form');
const itemsList = document.getElementById('items-list');
const emptyMsg = document.getElementById('empty-msg');

function showFriendlyError(message) {
    window.alert(message);
}

function parseJsonOrThrow(response, message) {
    if (!response.ok) {
        throw new Error(message + ' (HTTP ' + response.status + ').');
    }

    return response.json().catch(function () {
        throw new Error('O servidor retornou um formato inválido.');
    });
}

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
        fetch('/items/' + item.id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: item.name, completed: !item.completed }),
        })
            .then(function (r) {
                return parseJsonOrThrow(r, 'Não foi possível atualizar o item');
            })
            .then(function (updated) {
                row.replaceWith(createItemElement(updated));
            })
            .catch(function (err) {
                console.error(err);
                showFriendlyError(err.message);
            });
    });

    const name = document.createElement('span');
    name.className = 'item-name';
    name.textContent = item.name;

    var remove = document.createElement('button');
    remove.className = 'btn-icon remove-btn';
    remove.innerHTML = '&#128465;';
    remove.title = 'Remover Item';
    remove.addEventListener('click', function () {
        fetch('/items/' + item.id, { method: 'DELETE' })
            .then(function (r) {
                if (!r.ok) {
                    throw new Error('Não foi possível remover o item (HTTP ' + r.status + ').');
                }
            })
            .then(function () {
                row.remove();
                updateEmptyMessage();
            })
            .catch(function (err) {
                console.error(err);
                showFriendlyError(err.message);
            });
    });

    row.appendChild(toggle);
    row.appendChild(name);
    row.appendChild(remove);
    return row;
}

function loadItems() {
    fetch('/items')
        .then(function (r) {
            return parseJsonOrThrow(r, 'Não foi possível carregar os itens');
        })
        .then(function (items) {
            itemsList.innerHTML = '';
            items.forEach(function (item) {
                itemsList.appendChild(createItemElement(item));
            });
            updateEmptyMessage();
        })
        .catch(function (err) {
            console.error(err);
            showFriendlyError(err.message);
        });
}

addForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var value = itemInput.value.trim();
    if (!value) return;

    addBtn.disabled = true;
    addBtn.textContent = 'Adicionando...';

    fetch('/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: value }),
    })
        .then(function (r) {
            return parseJsonOrThrow(r, 'Não foi possível adicionar o item');
        })
        .then(function (item) {
            itemsList.appendChild(createItemElement(item));
            itemInput.value = '';
            addBtn.disabled = false;
            addBtn.textContent = 'Adicionar Item';
            updateEmptyMessage();
        })
        .catch(function (err) {
            console.error(err);
            showFriendlyError(err.message);
            addBtn.disabled = false;
            addBtn.textContent = 'Adicionar Item';
        });
});

loadItems();
