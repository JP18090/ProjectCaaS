# Lista de Mercado - ProjectCaaS

Aplicação web fullstack de lista de mercado (to-do list) com **backend em Java Spring Boot** e **frontend em HTML/CSS/JavaScript puro** (vanilla JS), orquestrada com **Docker Compose**.

---

## Visão Geral

Uma aplicação simples e funcional que permite:

- Adicionar itens à lista de mercado
- Marcar itens como concluídos
- Remover itens da lista

---

## Arquitetura

```
ProjectCaaS/
├── docker-compose.yml        # Orquestra backend + frontend
├── backend/                  # API REST (Java Spring Boot)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/projectcaas/todo/
│       ├── TodoApplication.java            # Classe principal
│       ├── model/TodoItem.java             # Entidade JPA
│       ├── repository/TodoItemRepository.java  # Repositório Spring Data
│       └── controller/TodoItemController.java  # REST Controller
├── frontend/                 # Interface web (Vanilla JS + Nginx)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── static/
│       ├── index.html
│       ├── css/styles.css
│       └── js/app.js
```

| Componente | Tecnologia | Porta |
|------------|-----------|-------|
| Backend    | Java 21 + Spring Boot 3.4 | 25000 |
| Frontend   | HTML/CSS/JS + Nginx | 80 |
| Banco de dados | H2 (em memória) | — |

---

## Arquitetura AWS 

<img width="1226" height="419" alt="566495257-c6c15dd7-a7a5-4f9d-9257-d74b0027441a" src="https://github.com/user-attachments/assets/2c42b095-aa6e-40fa-a8a1-218d94a2dbe5" />


| Componente                | Tipo / Tecnologia        | Detalhes |
|--------------------------|--------------------------|----------|
| VPC                      | Rede AWS                 | 10.0.0.0/16 |
| Subnet Pública 1         | AWS Subnet               | 10.0.0.0/24 (AZ A) |
| Subnet Pública 2         | AWS Subnet               | 10.0.2.0/24 (AZ B) |
| Subnet Privada 1         | AWS Subnet               | 10.0.1.0/24 (AZ A) |
| Subnet Privada 2         | AWS Subnet               | 10.0.3.0/24 (AZ B) |
| Internet Gateway         | Gateway                  | Acesso externo (0.0.0.0/0) |
| NAT Gateway              | Gateway                  | Saída da rede privada |
| Tabela de Rota Pública   | Routing                  | Internet Gateway |
| Tabela de Rota Privada   | Routing                  | NAT Gateway |
| Servidor Web 1           | EC2 + IIS                | Subnet pública |
| Servidor Web 2           | EC2                      | Subnet privada |
| Grupo de Segurança       | Firewall AWS             | Protege instância IIS |

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/)

**Ou, para desenvolvimento local sem Docker:**

- Java 21+
- Maven 3.9+

---

## Como Executar

### Com Docker Compose (recomendado)

```bash
# Subir a aplicação
docker compose up -d

# Acessar no navegador
# http://localhost

# Parar a aplicação
docker compose down
```

### Sem Docker (desenvolvimento)

```bash
cd backend
mvn spring-boot:run
```

> Neste modo, apenas a API estará disponível em `http://localhost:25000`. O frontend precisa ser servido separadamente.

---

## API REST

A API está disponível na porta **25000** (acesso direto) ou via proxy Nginx na porta **80** (caminho `/items`).

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/items` | Listar todos os itens |
| `POST` | `/items` | Criar um novo item |
| `PUT` | `/items/{id}` | Atualizar um item |
| `DELETE` | `/items/{id}` | Remover um item |

### Exemplos com cURL

```bash
# Listar itens
curl http://localhost/items

# Adicionar item
curl -X POST http://localhost/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Arroz"}'

# Marcar como concluído
curl -X PUT http://localhost/items/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Arroz", "completed": true}'

# Remover item
curl -X DELETE http://localhost/items/{id}
```

---

## Tecnologias

**Backend:**
- Java 21
- Spring Boot 3.4
- Spring Data JPA
- H2 Database (em memória)
- Maven

**Frontend:**
- HTML5
- CSS3
- JavaScript (vanilla, sem frameworks)
- Nginx (servidor web e reverse proxy)

**Infraestrutura:**
- Docker
- Docker Compose

---

## Banco de Dados

A aplicação utiliza o banco de dados **H2 em memória** por padrão. Os dados são mantidos enquanto o servidor estiver rodando e são recriados automaticamente a cada reinicialização.

A tabela `todo_items` possui a seguinte estrutura:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | VARCHAR(36) | UUID gerado automaticamente |
| `name` | VARCHAR(255) | Nome do item |
| `completed` | BOOLEAN | Status de conclusão |

---

## Desenvolvedores do Caas
- José Pedro Bitetti
- [Gustavo Netto](https://github.com/gustavonc05)
- [Gabriel Labarca del bianco ](https://github.com/LabasMarketing)
