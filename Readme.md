# Sistema de Gestão Comercial - Backend

Este é o backend de um sistema de gestão comercial desenvolvido em Node.js. A aplicação lida com dados de clientes, pedidos, produtos e pagamentos, proporcionando funcionalidades essenciais para a operação de uma empresa. O sistema foi estruturado para ser flexível e escalável, integrando diversas áreas de negócios.

## Tecnologias Utilizadas

- **Node.js**: Plataforma utilizada para o desenvolvimento do backend.
- **Express.js**: Framework web utilizado para a criação das rotas e estruturação do servidor.

## Funcionalidades

Este sistema oferece diversas funcionalidades que facilitam a gestão dos dados comerciais da empresa. Abaixo estão as principais rotas implementadas:

### Rotas de Pedidos

- `POST /pedidoCliente`: Consulta detalhes de um pedido específico de um cliente.
- `GET /pedidosCliente`: Lista todos os pedidos de um cliente.
- `GET /pedidosClienteNaoImpressos`: Lista todos os pedidos de um cliente que ainda não foram impressos.
- `GET /pedidoBloqueioMotivo`: Consulta o motivo do bloqueio de um pedido de cliente.
- `GET /pedidosBloqueados`: Lista todos os pedidos bloqueados.
- `PUT /pedidoClienteZerarImpressao`: Zera o status de impressão de um pedido.
- `PUT /pedidoClienteModificarImpressao`: Modifica o status de impressão de um pedido.

### Rotas de Produtos

- `GET /produtoFilial`: Consulta informações de um produto em uma filial específica.
- `GET /precoUltimaEntrada`: Consulta o preço da última entrada de um produto.

### Rotas de CNAE

- `GET /cnae`: Lista ou consulta dados do CNAE.

### Rotas de Filiais

- `GET /filial`: Lista ou consulta informações de uma filial.

### Rotas de Planos de Pagamento

- `GET /planoPagamento`: Lista ou consulta planos de pagamento disponíveis.

### Rotas de Clientes

- `GET /informacoesFinanceirasCliente`: Consulta as informações financeiras de um cliente.
- `GET /cliente`: Lista ou consulta os dados de um cliente.
- `GET /clienteByRca`: Consulta clientes associados a um determinado RCA.

## Projeto Desenvolvido para Uso Interno

Este projeto foi desenvolvido para atender às necessidades específicas da empresa onde trabalho. Ele proporciona uma solução eficiente para a gestão de clientes, pedidos, produtos e pagamentos, otimizando várias áreas no contexto do nosso ambiente de trabalho.
