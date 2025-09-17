# Nome do arquivo docker-compose para staging
COMPOSE_FILE=docker-compose.yaml

# Subir os containers
up:
	docker-compose -f $(COMPOSE_FILE) up -d

# Subir e forçar rebuild
build:
	docker-compose -f $(COMPOSE_FILE) up -d --build

# Parar os containers
down:
	docker-compose -f $(COMPOSE_FILE) down

# Verificar os logs dos containers
logs:
	docker-compose -f $(COMPOSE_FILE) logs -f nest-app

# Executar comandos dentro do container
sh:
	docker-compose -f $(COMPOSE_FILE) exec nest-app sh
