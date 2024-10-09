const express = require("express");

const router = express.Router();

const pedidoCliente = require("./controller/pedido/pedidoCliente");
const pedidosCliente = require("./controller/pedido/pedidosCliente");
const pedidosClienteNaoImpressos = require("./controller/pedido/pedidosClienteNaoImpressos");
const pedidoBloqueioMotivo = require("./controller/pedido/pedidoClienteMotivoBloqueio");
const pedidosBloqueados = require("./controller/pedido/pedidosBloqueados");

const pedidoClienteZerarImpressao = require("./controller/pedido/pedidoClienteZerarImpressao");
const pedidoClienteModificarImpresao = require("./controller/pedido/pedidoClienteModificarImpresao");

const produtoFilial = require("./controller/produto/filial/produto");
const precoUltimaEntrada = require("./controller/produto/precoUltimaEntrada");

const cnae = require("./controller/cnae/cnae");

const filial = require("./controller/filial/filial");

const planoPagamento = require("./controller/planoPagamento/planoPagamento");

const informacoesFinanceirasCliente = require("./controller/cliente/informacoesFinanceiras");
const cliente = require("./controller/cliente/cliente");
const clienteByRca = require("./controller/cliente/clienteByRca");

router.get("/pedido/cliente/numPed/:numPed", pedidoCliente);
router.get("/pedido/cliente/:codCli", pedidosCliente);
router.get("/pedido/naoImpressos", pedidosClienteNaoImpressos);
router.get("/pedido/motivoBloqueio/:numPed", pedidoBloqueioMotivo);
router.get("/pedido/cliente/lista/bloqueados", pedidosBloqueados);

router.get("/produto/filial/descricao", produtoFilial.byDescricao);
router.get("/produto/filial/codigo", produtoFilial.byCodigo);
router.get("/produto/filial/codigoBarra", produtoFilial.byCodigoBarra);
router.get("/produto/filial/mixCliente", produtoFilial.byMixCliente);

router.post("/produto/precoUltimaEntrada", precoUltimaEntrada);

router.get("/cnae/:cnae", cnae);

router.get("/filial", filial);

router.get("/planoPagamento", planoPagamento);

router.get(
  "/cliente/:codCli/informacoesFinanceiras",
  informacoesFinanceirasCliente
);

router.get("/cliente/:codCli", cliente);
router.get("/cliente/filter/byRca", clienteByRca);

router.put(
  "/pedido/cliente/zerarImpressao/:numPed",
  pedidoClienteZerarImpressao
);
router.put(
  "/pedido/cliente/modificarImpressao/:numPed",
  pedidoClienteModificarImpresao
);

module.exports = router;
