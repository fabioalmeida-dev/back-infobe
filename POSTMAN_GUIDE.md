# Guia da Coleção Postman - Back InfoBe API

## 📋 Visão Geral

Esta coleção contém todos os endpoints da API do sistema Back InfoBe, organizados por módulos funcionais.

## 🚀 Como Usar

### 1. Importar a Coleção
1. Abra o Postman
2. Clique em "Import"
3. Selecione o arquivo `postman_collection.json`
4. A coleção será importada com todas as requisições organizadas

### 2. Configurar Variáveis
A coleção já vem configurada com as seguintes variáveis:
- `base_url`: http://localhost:3000 (ajuste conforme necessário)
- `jwt_token`: será preenchido automaticamente após o login

### 3. Autenticação
1. Execute a requisição **Auth > Login** primeiro
2. O token JWT será automaticamente salvo na variável `jwt_token`
3. As demais requisições protegidas usarão este token automaticamente

## 📁 Estrutura da Coleção

### 🔐 Auth
- **POST** `/auth/login` - Fazer login
- **POST** `/auth/register` - Registrar novo usuário

### 📚 Courses
- **GET** `/course` - Listar todos os cursos
- **GET** `/course/:id` - Obter curso por ID (público)
- **GET** `/course/:id` - Obter curso por ID (com progresso - autenticado)
- **POST** `/course` - Criar novo curso
- **PATCH** `/course/:id` - Atualizar curso
- **DELETE** `/course/:id` - Deletar curso
- **GET** `/course/user/recent-lessons` - Últimas aulas vistas
- **GET** `/course/user/recommended` - Cursos recomendados
- **GET** `/course/user/my-courses` - Meus cursos

### 📖 Modules
- **GET** `/module` - Listar todos os módulos
- **GET** `/module/:id` - Obter módulo por ID
- **POST** `/module` - Criar novo módulo
- **PATCH** `/module/:id` - Atualizar módulo
- **DELETE** `/module/:id` - Deletar módulo

### 🎥 Lessons
- **GET** `/lesson` - Listar todas as aulas
- **GET** `/lesson/:id` - Obter aula por ID
- **POST** `/lesson` - Criar nova aula
- **PATCH** `/lesson/:id` - Atualizar aula
- **DELETE** `/lesson/:id` - Deletar aula
- **POST** `/lesson/:id/view` - Marcar aula como vista
- **POST** `/lesson/:id/complete` - Marcar aula como concluída

### 🏆 Certificates
- **GET** `/certificate` - Listar certificados do usuário
- **GET** `/certificate/:id` - Obter certificado por ID
- **POST** `/certificate` - Gerar certificado para curso

## 🔑 Endpoints Protegidos

Os seguintes endpoints requerem autenticação (token JWT):
- Todos os endpoints de **criação, atualização e exclusão**
- Endpoints específicos do usuário (`/course/user/*`)
- Todos os endpoints de **certificados**
- Endpoints de **progresso** (`/lesson/*/view`, `/lesson/*/complete`)

## 📝 Exemplos de Uso

### Fluxo Básico
1. **Registrar usuário**: `POST /auth/register`
2. **Fazer login**: `POST /auth/login`
3. **Listar cursos**: `GET /course`
4. **Ver detalhes do curso**: `GET /course/1`
5. **Marcar aula como vista**: `POST /lesson/1/view`
6. **Completar aula**: `POST /lesson/1/complete`
7. **Gerar certificado**: `POST /certificate`

### Dados de Exemplo

#### Registro de Usuário
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "password123"
}
```

#### Criação de Curso
```json
{
  "title": "Curso de JavaScript",
  "description": "Aprenda JavaScript do básico ao avançado",
  "thumbnail": "https://example.com/thumbnail.jpg",
  "price": 199.99
}
```

#### Criação de Módulo
```json
{
  "title": "Introdução ao JavaScript",
  "description": "Conceitos básicos da linguagem",
  "course_id": 1
}
```

#### Criação de Aula
```json
{
  "title": "Variáveis em JavaScript",
  "description": "Como declarar e usar variáveis",
  "content": "Conteúdo da aula sobre variáveis...",
  "video_url": "https://example.com/video1.mp4",
  "duration": 600,
  "module_id": 1
}
```

## 🛠️ Configurações Avançadas

### Ambiente de Desenvolvimento
- Base URL: `http://localhost:3000`
- Porta padrão: 3000

### Ambiente de Produção
- Ajuste a variável `base_url` para o endereço do servidor de produção
- Exemplo: `https://api.backinfobe.com`

## 📊 Códigos de Resposta

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Erro de validação
- **401**: Não autorizado
- **403**: Acesso negado
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

## 🔧 Troubleshooting

### Token Expirado
- Execute novamente o login para obter um novo token
- O token é automaticamente atualizado na variável da coleção

### Erro de Conexão
- Verifique se o servidor está rodando
- Confirme se a `base_url` está correta
- Verifique se não há firewall bloqueando a conexão

### Erro 404
- Verifique se o ID do recurso existe
- Confirme se a rota está correta

---

**Desenvolvido para o sistema Back InfoBe** 🚀