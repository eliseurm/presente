// Acessa a variável de ambiente 'PORT'. Se não estiver definida, usa '9000' como padrão.
const port = process.env.PORT_BACK || '9000';

const PROXY_CONFIG = {
    "/api": {
        "target": `http://localhost:${port}`,
        "secure": false,
        "changeOrigin": false,
        "logLevel": "debug",
        "pathRewrite": {
            "^/api": ""
        }
    }
};

// Exporta a configuração para que o Angular CLI possa lê-la
module.exports = PROXY_CONFIG;
